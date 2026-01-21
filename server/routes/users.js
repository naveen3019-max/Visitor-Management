const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users/pending
// @desc    Get pending user approvals
// @access  Private (Principal only)
router.get('/pending', protect, authorize('principal'), async (req, res) => {
  try {
    console.log('Fetching pending users. Requested by:', req.user);
    
    const pendingUsers = await User.find({ isApproved: false })
      .populate('department', 'name')
      .select('-password -pin')
      .sort({ createdAt: -1 });

    console.log(`Found ${pendingUsers.length} pending users`);

    res.json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve user
// @access  Private (Admin only)
router.put('/:id/approve', protect, authorize('principal'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password -pin');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User approved successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('principal'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', protect, authorize('principal'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('department', 'name')
      .select('-password -pin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
