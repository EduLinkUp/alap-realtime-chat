const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const { getRedisClient } = require('../config/redis');

// Store online users
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Add user to online users map
    onlineUsers.set(socket.userId, socket.id);

    // Update user status and socket ID
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      socketId: socket.id,
      lastSeen: new Date()
    });

    // Broadcast user online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      status: 'online'
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Get user's groups and join those rooms
    const groups = await Group.find({ 'members.user': socket.userId });
    groups.forEach(group => {
      socket.join(group._id.toString());
    });

    // Handle private message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, messageType, fileUrl, fileName, fileSize } = data;

        // Check if receiver has blocked sender
        const receiver = await User.findById(receiverId);
        if (receiver.blockedUsers.includes(socket.userId)) {
          socket.emit('message_blocked', {
            message: 'You are blocked by this user'
          });
          return;
        }

        // Create message
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize,
          deliveryStatus: 'sent'
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar status')
          .populate('receiver', 'name avatar status');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', populatedMessage);
          
          // Update delivery status
          message.deliveryStatus = 'delivered';
          message.deliveredTo.push({
            user: receiverId,
            deliveredAt: new Date()
          });
          await message.save();

          // Send delivery confirmation to sender
          socket.emit('message_delivered', {
            messageId: message._id,
            deliveredAt: new Date()
          });
        }

        // Send confirmation to sender
        socket.emit('message_sent', populatedMessage);

        // Store in Redis for offline messages
        const redisClient = getRedisClient();
        await redisClient.lPush(
          `offline_messages:${receiverId}`,
          JSON.stringify(populatedMessage)
        );
        await redisClient.expire(`offline_messages:${receiverId}`, 7 * 24 * 60 * 60); // 7 days

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', {
          message: 'Failed to send message'
        });
      }
    });

    // Handle group message
    socket.on('send_group_message', async (data) => {
      try {
        const { groupId, content, messageType, fileUrl, fileName, fileSize } = data;

        const group = await Group.findById(groupId);
        
        if (!group) {
          socket.emit('message_error', { message: 'Group not found' });
          return;
        }

        // Check if user is a member
        const isMember = group.members.some(
          member => member.user.toString() === socket.userId
        );

        if (!isMember) {
          socket.emit('message_error', {
            message: 'Not authorized to send messages in this group'
          });
          return;
        }

        // Create message
        const message = await Message.create({
          sender: socket.userId,
          group: groupId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar status');

        // Update group's last message
        group.lastMessage = message._id;
        await group.save();

        // Send to all group members
        io.to(groupId).emit('receive_group_message', {
          ...populatedMessage.toObject(),
          groupId
        });

      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('message_error', {
          message: 'Failed to send group message'
        });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', ({ receiverId, isGroup }) => {
      if (isGroup) {
        socket.to(receiverId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          groupId: receiverId
        });
      } else {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', {
            userId: socket.userId,
            userName: socket.user.name
          });
        }
      }
    });

    socket.on('typing_stop', ({ receiverId, isGroup }) => {
      if (isGroup) {
        socket.to(receiverId).emit('user_stop_typing', {
          userId: socket.userId,
          groupId: receiverId
        });
      } else {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_stop_typing', {
            userId: socket.userId
          });
        }
      }
    });

    // Handle message read
    socket.on('message_read', async ({ messageId, senderId }) => {
      try {
        const message = await Message.findById(messageId);
        
        if (message) {
          message.deliveryStatus = 'read';
          message.readBy.push({
            user: socket.userId,
            readAt: new Date()
          });
          await message.save();

          // Notify sender
          const senderSocketId = onlineUsers.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read_receipt', {
              messageId,
              readBy: socket.userId,
              readAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle user status change
    socket.on('change_status', async ({ status }) => {
      try {
        await User.findByIdAndUpdate(socket.userId, { status });
        
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          status
        });
      } catch (error) {
        console.error('Error changing status:', error);
      }
    });

    // Handle join group
    socket.on('join_group', ({ groupId }) => {
      socket.join(groupId);
    });

    // Handle leave group
    socket.on('leave_group', ({ groupId }) => {
      socket.leave(groupId);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Update user status
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: new Date(),
        socketId: null
      });

      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date()
      });
    });

    // Handle get offline messages
    socket.on('get_offline_messages', async () => {
      try {
        const redisClient = getRedisClient();
        const messages = await redisClient.lRange(`offline_messages:${socket.userId}`, 0, -1);
        
        if (messages && messages.length > 0) {
          const parsedMessages = messages.map(msg => JSON.parse(msg));
          socket.emit('offline_messages', parsedMessages);
          
          // Clear offline messages
          await redisClient.del(`offline_messages:${socket.userId}`);
        }
      } catch (error) {
        console.error('Error getting offline messages:', error);
      }
    });
  });
};

module.exports = socketHandler;
