const express = require('express');
const { body } = require('express-validator');
const {
  createAnnouncement,
  getWorkspaceAnnouncements,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkWorkspaceMembership } = require('../middleware/accessMiddleware');

const router = express.Router();

// Validation rules
const createAnnouncementValidation = [
  body('workspace').notEmpty().withMessage('Workspace ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high'])
    .withMessage('Priority must be low, normal, or high'),
];

// Create announcement - admin or leader only
router.post(
  '/',
  protect,
  authorize('admin', 'leader'),
  createAnnouncementValidation,
  createAnnouncement
);

// Get announcements for a workspace - members only
// Note: This route is registered in workspaceRoutes as GET /api/workspaces/:id/announcements

module.exports = router;
