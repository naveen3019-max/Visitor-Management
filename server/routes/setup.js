const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/setup/check
// @desc    Check if initial setup is needed
// @access  Public
router.get('/check', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    res.json({
      success: true,
      setupNeeded: adminCount === 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/setup/initialize
// @desc    Create first admin user
// @access  Public (only works if no admin exists)
router.post('/initialize', async (req, res) => {
  try {
    // Check if admin already exists
    const principalCount = await User.countDocuments({ role: 'principal' });
    
    if (principalCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Setup already completed'
      });
    }

    const { username, password, pin, fullName } = req.body;

    // Validation
    if (!username || !password || !pin || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create admin user
    const principal = await User.create({
      username,
      password,
      pin,
      fullName,
      role: 'principal',
      isApproved: true
    });

    res.status(201).json({
      success: true,
      message: 'Initial admin created successfully',
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
