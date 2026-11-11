const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['message', 'announcement'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Related references (optional, for linking)
    relatedAnnouncement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
    },
    relatedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    relatedChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by recipient and read status
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
