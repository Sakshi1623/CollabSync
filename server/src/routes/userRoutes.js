const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  updateUserRole,
  updateOwnProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, authorize('admin'), getAllUsers);

// Update user role (admin only)
router.patch(
  '/:id/role',
  protect,
  authorize('admin'),
  [
    body('role')
      .isIn(['admin', 'leader', 'member'])
      .withMessage('Role must be admin, leader, or member'),
  ],
  updateUserRole
);

// Update own profile (authenticated users)
router.patch(
  '/me',
  protect,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
  ],
  updateOwnProfile
);

module.exports = router;
