const Message = require('../models/Message');
const Channel = require('../models/Channel');
const { isValidObjectId } = require('../middleware/accessMiddleware');

/**
 * @desc    Get message history for a channel
 * @route   GET /api/channels/:id/messages
 * @access  Private (channel members only)
 * @note    Returns last 50 messages by default, supports pagination
 */
const getChannelMessages = async (req, res, next) => {
  try {
    const channelId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // Message ID to fetch messages before (for pagination)

    // Validate ObjectId
    if (!isValidObjectId(channelId)) {
      return res.status(400).json({ message: 'Invalid channel ID' });
    }

    // Find channel and check membership
    const channel = await Channel.findById(channelId).populate('workspace');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is a member of the channel's workspace
    const isMember = channel.workspace.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: not a workspace member' });
    }

    // Build query
    const query = { channel: channelId };

    // If 'before' is provided, fetch messages older than that message
    if (before) {
      if (!isValidObjectId(before)) {
        return res.status(400).json({ message: 'Invalid before parameter' });
      }
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages (newest first)
    const messages = await Message.find(query)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Reverse to show oldest first
    messages.reverse();

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChannelMessages,
};
