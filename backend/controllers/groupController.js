const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, members, avatar } = req.body;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: 'Group name and members are required' });
    }

    // Add creator as admin
    const groupMembers = [
      { user: req.user._id, role: 'admin' },
      ...members.map(userId => ({ user: userId, role: 'member' }))
    ];

    const group = await Group.create({
      name,
      description,
      avatar,
      admin: req.user._id,
      members: groupMembers
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar status');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all groups for current user
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isActive: true
    })
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ groups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar status');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this group' });
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can update group' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar) group.avatar = avatar;

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar status');

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    // Check if user is already a member
    const isMember = group.members.some(
      member => member.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'User already a member' });
    }

    group.members.push({ user: userId, role: 'member' });
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar status');

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    group.members = group.members.filter(
      member => member.user.toString() !== userId
    );
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email avatar')
      .populate('members.user', 'name email avatar status');

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // If admin is leaving, assign new admin
    if (group.admin.toString() === req.user._id.toString()) {
      const remainingMembers = group.members.filter(
        member => member.user.toString() !== req.user._id.toString()
      );

      if (remainingMembers.length > 0) {
        group.admin = remainingMembers[0].user;
        remainingMembers[0].role = 'admin';
      } else {
        // No members left, deactivate group
        group.isActive = false;
      }
    }

    group.members = group.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );
    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get group messages
// @route   GET /api/groups/:id/messages
// @access  Private
const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view group messages' });
    }

    const messages = await Message.find({
      group: id,
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
    })
      .populate('sender', 'name avatar status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Message.countDocuments({
      group: id,
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
    });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalMessages: count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send group message
// @route   POST /api/groups/:id/messages
// @access  Private
const sendGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType, fileUrl, fileName, fileSize } = req.body;

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to send messages in this group' });
    }

    const message = await Message.create({
      sender: req.user._id,
      group: id,
      content,
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      fileSize
    });

    // Update group's last message
    group.lastMessage = message._id;
    await group.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar status');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  addMember,
  removeMember,
  leaveGroup,
  getGroupMessages,
  sendGroupMessage
};
