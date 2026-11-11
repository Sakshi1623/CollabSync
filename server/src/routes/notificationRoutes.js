const express = require('express');
const {
  getUserNotifications,
  markAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's notifications
router.get('/', protect, getUserNotifications);

// Get unread count
router.get('/unread/count', protect, getUnreadCount);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
