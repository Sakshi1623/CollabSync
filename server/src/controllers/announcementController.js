const Announcement = require('../models/Announcement');
const Workspace = require('../models/Workspace');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('../middleware/accessMiddleware');

/**
 * @desc    Create an announcement in a workspace
 * @route   POST /api/announcements
 * @access  Private/Admin or Leader
 * @note    Creates notifications for all workspace members and emits socket events
 */
const createAnnouncement = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workspace: workspaceId, title, content, priority } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    // Find workspace and verify membership
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: not a workspace member' });
    }

    // Create announcement
    const announcement = await Announcement.create({
      workspace: workspaceId,
      title,
      content,
      priority: priority || 'normal',
      author: req.user.id,
    });

    // Populate author info
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'name email')
      .populate('workspace', 'name');

    // Create notifications for all workspace members
    const notificationPromises = workspace.members.map((memberId) =>
      Notification.create({
        recipient: memberId,
        type: 'announcement',
        message: `New announcement in ${workspace.name}: ${title}`,
        relatedAnnouncement: announcement._id,
      })
    );

    await Promise.all(notificationPromises);

    // Get Socket.IO instance from app (attached in server.js)
    const io = req.app.get('io');

    if (io) {
      // Emit newAnnouncement to workspace room
      io.to(`workspace:${workspaceId}`).emit('newAnnouncement', populatedAnnouncement);

      // Emit newNotification to each member's personal room
      workspace.members.forEach((memberId) => {
        io.to(`user:${memberId}`).emit('newNotification', {
          type: 'announcement',
          message: `New announcement in ${workspace.name}: ${title}`,
          announcementId: announcement._id,
        });
      });
    }

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get announcements for a workspace
 * @route   GET /api/workspaces/:id/announcements
 * @access  Private (workspace members only)
 */
const getWorkspaceAnnouncements = async (req, res, next) => {
  try {
    const workspaceId = req.params.id;

    // Validate ObjectId
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    // Find workspace and check membership
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied: not a workspace member' });
    }

    // Fetch announcements (newest first)
    const announcements = await Announcement.find({ workspace: workspaceId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getWorkspaceAnnouncements,
};
