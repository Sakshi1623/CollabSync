const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');

/**
 * Check if the provided ID is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Middleware to check if user is a member of a workspace
 * Requires protect middleware to run first (sets req.user)
 */
const checkWorkspaceMembership = async (req, res, next) => {
  try {
    const workspaceId = req.params.id || req.params.workspaceId;

    // Validate ObjectId
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

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

    // Attach workspace to request for use in controller
    req.workspace = workspace;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is a member of a channel's workspace
 * Requires protect middleware to run first (sets req.user)
 */
const checkChannelAccess = async (req, res, next) => {
  try {
    const channelId = req.params.id || req.params.channelId;

    // Validate ObjectId
    if (!isValidObjectId(channelId)) {
      return res.status(400).json({ message: 'Invalid channel ID' });
    }

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

    // Attach channel to request for use in controller
    req.channel = channel;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkWorkspaceMembership,
  checkChannelAccess,
  isValidObjectId,
};
