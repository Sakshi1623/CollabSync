const express = require('express');
const { body } = require('express-validator');
const {
  createChannel,
  getWorkspaceChannels,
} = require('../controllers/channelController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkWorkspaceMembership } = require('../middleware/accessMiddleware');

const router = express.Router();

// Validation rules
const createChannelValidation = [
  body('name').trim().notEmpty().withMessage('Channel name is required'),
  body('workspace').notEmpty().withMessage('Workspace ID is required'),
];

// Create channel - admin or leader only
router.post(
  '/',
  protect,
  authorize('admin', 'leader'),
  createChannelValidation,
  createChannel
);

// Note: GET /api/workspaces/:id/channels is handled in workspaceRoutes

module.exports = router;
