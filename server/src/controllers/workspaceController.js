const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('../middleware/accessMiddleware');

/**
 * @desc    Create a new workspace
 * @route   POST /api/workspaces
 * @access  Private/Admin or Leader
 * @note    Automatically creates #general channel and adds creator as member
 */
const createWorkspace = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Create workspace with creator as owner and member
    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: req.user.id,
      members: [req.user.id], // Add creator as member
    });

    // Create default #general channel
    const generalChannel = await Channel.create({
      name: 'general',
      workspace: workspace._id,
      createdBy: req.user.id,
      members: [req.user.id], // Add creator as member
    });

    // Populate workspace data
    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      workspace: populatedWorkspace,
      generalChannel: {
        _id: generalChannel._id,
        name: generalChannel.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all workspaces the user is a member of
 * @route   GET /api/workspaces
 * @access  Private
 * @note    Returns only workspaces where user is in members array
 */
const getWorkspaces = async (req, res, next) => {
  try {
    // Find workspaces where user is a member
    const workspaces = await Workspace.find({
      members: req.user.id,
    })
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a member to a workspace by email
 * @route   POST /api/workspaces/:id/members
 * @access  Private/Admin or Leader
 * @note    Also adds the member to all existing channels in the workspace
 */
const addMember = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const workspaceId = req.params.id;

    // Validate ObjectId
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    // Find workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is already a member
    const isAlreadyMember = workspace.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // Add user to workspace members
    workspace.members.push(user._id);
    await workspace.save();

    // Add user to ALL existing channels in this workspace
    await Channel.updateMany(
      { workspace: workspaceId },
      { $addToSet: { members: user._id } }
    );

    // Populate and return updated workspace
    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    res.json({
      message: 'Member added successfully',
      workspace: updatedWorkspace,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  addMember,
};
