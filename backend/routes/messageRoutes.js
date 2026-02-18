const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  searchMessages,
  getConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/search', protect, searchMessages);
router.get('/:userId', protect, getChatHistory);
router.post('/', protect, sendMessage);
router.put('/read/:userId', protect, markMessagesAsRead);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
