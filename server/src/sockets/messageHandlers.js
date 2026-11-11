const Message = require('../models/Message');
const Channel = require('../models/Channel');
const { createMessageNotifications } = require('../utils/notificationHelper');

/**
 * Handle sendMessage event
 * Validates content, checks membership, saves to MongoDB, broadcasts to channel
 * Creates notifications for offline channel members
 */
const handleSendMessage = async (socket, io, data, callback) => {
  try {
    const { channelId, content } = data;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return callback?.({ error: 'Message content cannot be empty' });
    }

    if (content.length > 2000) {
      return callback?.({ error: 'Message cannot exceed 2000 characters' });
    }

    // Find channel and verify membership
    const channel = await Channel.findById(channelId).populate('workspace');

    if (!channel) {
      return callback?.({ error: 'Channel not found' });
    }

    // Check if user is a member of the workspace
    const isMember = channel.workspace.members.some(
      (memberId) => memberId.toString() === socket.userId
    );

    if (!isMember) {
      return callback?.({ error: 'Access denied: not a workspace member' });
    }

    // Save message to MongoDB
    const message = await Message.create({
      channel: channelId,
      sender: socket.userId,
      content: content.trim(),
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    // Broadcast message to all clients in the channel room (including sender)
    const roomName = `channel:${channelId}`;
    io.to(roomName).emit('receiveMessage', populatedMessage);

    console.log(`Message sent in channel ${channelId} by ${socket.user.name}`);

    // Create notifications for offline channel members
    await createMessageNotifications(message, channel.members, io);

    // Acknowledge to sender
    callback?.({ ok: true, message: populatedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    callback?.({ error: 'Failed to send message' });
  }
};

module.exports = {
  handleSendMessage,
};
