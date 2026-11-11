const Channel = require('../models/Channel');
const Workspace = require('../models/Workspace');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('../middleware/accessMiddleware');

/**
 * @desc    Create a new channel in a workspace
 * @route   POST /api/channels
 * @access  Private/Admin or Leader
 * @note    All workspace members are automatically added to the channel
 */
const createChannel = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, workspace: workspaceId } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    // Find workspace
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

    // Check for duplicate channel name in workspace
    const existingChannel = await Channel.findOne({
      name: name.toLowerCase().trim(),
      workspace: workspaceId,
    });

    if (existingChannel) {
      return res.status(400).json({
        message: 'A channel with this name already exists in the workspace',
      });
    }

    // Create channel with all workspace members
    const channel = await Channel.create({
      name: name.toLowerCase().trim(),
      workspace: workspaceId,
      createdBy: req.user.id,
      members: workspace.members, // Add all workspace members
    });

    // Populate channel data
    const populatedChannel = await Channel.findById(channel._id)
      .populate('workspace', 'name')
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedChannel);
  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A channel with this name already exists in the workspace',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all channels in a workspace
 * @route   GET /api/workspaces/:id/channels
 * @access  Private
 * @note    User must be a member of the workspace (checked by middleware)
 */
const getWorkspaceChannels = async (req, res, next) => {
  try {
    const workspaceId = req.params.id;

    // Validate ObjectId
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    // req.workspace is set by checkWorkspaceMembership middleware
    // Find all channels in the workspace
    const channels = await Channel.find({ workspace: workspaceId })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: 1 });

    res.json(channels);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChannel,
  getWorkspaceChannels,
};
