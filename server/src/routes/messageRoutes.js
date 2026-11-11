const express = require('express');
const { getChannelMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get message history for a channel
router.get('/channels/:id/messages', protect, getChannelMessages);

module.exports = router;
