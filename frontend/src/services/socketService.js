import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('get_offline_messages');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    
    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    
    this.socket.off(event, callback);
    
    // Remove from listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  // Message methods
  sendMessage(data) {
    this.emit('send_message', data);
  }

  sendGroupMessage(data) {
    this.emit('send_group_message', data);
  }

  // Typing indicators
  startTyping(receiverId, isGroup = false) {
    this.emit('typing_start', { receiverId, isGroup });
  }

  stopTyping(receiverId, isGroup = false) {
    this.emit('typing_stop', { receiverId, isGroup });
  }

  // Read receipts
  markMessageAsRead(messageId, senderId) {
    this.emit('message_read', { messageId, senderId });
  }

  // Status
  changeStatus(status) {
    this.emit('change_status', { status });
  }

  // Group operations
  joinGroup(groupId) {
    this.emit('join_group', { groupId });
  }

  leaveGroup(groupId) {
    this.emit('leave_group', { groupId });
  }

  // Cleanup
  removeAllListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.off(event, callback);
      });
    });
    this.listeners.clear();
  }
}

const socketService = new SocketService();
export default socketService;
