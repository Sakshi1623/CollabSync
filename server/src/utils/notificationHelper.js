const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create notifications for offline channel members when a message is sent
 * @param {Object} message - The message object
 * @param {Array} channelMembers - Array of user IDs in the channel
 * @param {Object} io - Socket.IO instance
 */
const createMessageNotifications = async (message, channelMembers, io) => {
  try {
    // Get all offline users in the channel (exclude sender)
    const offlineUsers = await User.find({
      _id: { $in: channelMembers, $ne: message.sender },
      status: 'offline',
    });

    if (offlineUsers.length === 0) {
      return;
    }

    // Populate sender and channel info
    const populatedMessage = await message.populate([
      { path: 'sender', select: 'name' },
      { path: 'channel', select: 'name' },
    ]);

    // Create notifications for offline users
    const notificationPromises = offlineUsers.map((user) =>
      Notification.create({
        recipient: user._id,
        type: 'message',
        message: `New message from ${populatedMessage.sender.name} in #${populatedMessage.channel.name}`,
        relatedMessage: message._id,
        relatedChannel: message.channel,
      })
    );

    const notifications = await Promise.all(notificationPromises);

    // Emit newNotification to each offline user's personal room
    // (They'll receive it when they come back online)
    offlineUsers.forEach((user, index) => {
      if (io) {
        io.to(`user:${user._id}`).emit('newNotification', {
          _id: notifications[index]._id,
          type: 'message',
          message: `New message from ${populatedMessage.sender.name} in #${populatedMessage.channel.name}`,
          messageId: message._id,
          channelId: message.channel._id,
          isRead: false,
          createdAt: notifications[index].createdAt,
        });
      }
    });

    console.log(`Created ${notifications.length} message notifications for offline users`);
  } catch (error) {
    console.error('Error creating message notifications:', error);
  }
};

module.exports = {
  createMessageNotifications,
};
