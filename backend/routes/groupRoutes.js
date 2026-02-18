const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  addMember,
  removeMember,
  leaveGroup,
  getGroupMessages,
  sendGroupMessage
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);
router.put('/:id', protect, updateGroup);
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);
router.post('/:id/leave', protect, leaveGroup);
router.get('/:id/messages', protect, getGroupMessages);
router.post('/:id/messages', protect, sendGroupMessage);

module.exports = router;
