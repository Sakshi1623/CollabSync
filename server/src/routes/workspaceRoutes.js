const express = require('express');
const { body } = require('express-validator');
const {
  createWorkspace,
  getWorkspaces,
  addMember,
} = require('../controllers/workspaceController');
const { getWorkspaceChannels } = require('../controllers/channelController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkWorkspaceMembership } = require('../middleware/accessMiddleware');

const router = express.Router();

// Validation rules
const createWorkspaceValidation = [
  body('name').trim().notEmpty().withMessage('Workspace name is required'),
  body('description').optional().trim(),
];

const addMemberValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

// Create workspace - admin or leader only
router.post(
  '/',
  protect,
  authorize('admin', 'leader'),
  createWorkspaceValidation,
  createWorkspace
);

// Get all workspaces user is a member of
router.get('/', protect, getWorkspaces);

// Add member to workspace - admin or leader who is a member of the workspace
router.post(
  '/:id/members',
  protect,
  authorize('admin', 'leader'),
  checkWorkspaceMembership,
  addMemberValidation,
  addMember
);

// Get channels in a workspace - members only (checked by middleware)
router.get(
  '/:id/channels',
  protect,
  checkWorkspaceMembership,
  getWorkspaceChannels
);

module.exports = router;
