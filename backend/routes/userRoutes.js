const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  blockUser,
  unblockUser,
  getBlockedUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);
router.get('/blocked', protect, getBlockedUsers);
router.get('/:id', protect, getUserById);
router.post('/block/:userId', protect, blockUser);
router.post('/unblock/:userId', protect, unblockUser);

module.exports = router;
