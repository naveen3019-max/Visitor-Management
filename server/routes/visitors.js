const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Member = require('../models/Member');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Helper function to check/update member status
const checkMemberStatus = async (contact, name, memberId) => {
  try {
    // Check if member exists by phone or memberId
    let member = await Member.findOne({
      $or: [
        { phone: contact },
        ...(memberId ? [{ memberId }] : [])
      ]
    });

    if (member) {
      // Update existing member
      member.visitCount += 1;
      member.lastVisit = Date.now();
      if (memberId && !member.memberId) {
        member.memberId = memberId;
      }
      await member.save();
    } else {
      // Check visit count for this phone
      const visitCount = await Visitor.countDocuments({ contact });
      
      // Auto-detect member after 3+ visits
      if (visitCount >= 3) {
        member = await Member.create({
          memberId: memberId || null,
          phone: contact,
          name,
          visitCount: visitCount + 1,
          isAutoDetected: !memberId
        });
      }
    }

    return member;
  } catch (error) {
    console.error('Error checking member status:', error);
    return null;
  }
};

// @route   POST /api/visitors
// @desc    Log new visitor (Guard)
// @access  Private (Guard/Admin)
router.post('/', protect, async (req, res) => {
  try {
    const { name, contact, memberId, purpose, departmentId, personToMeet } = req.body;

    // Validation - only name, contact, and purpose are required
    if (!name || !contact || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, contact, purpose)'
      });
    }

    // Create visitor
    const visitor = await Visitor.create({
      name,
      contact,
      memberId: memberId || null,
      purpose,
      department: null,
      personToMeet: personToMeet || 'N/A',
      guardId: req.user.id
    });

    // Check/update member status
    await checkMemberStatus(contact, name, memberId);

    // Populate department for response
    await visitor.populate('department guardId', 'name username fullName');

    // Create notification for principal
    // Find all principals
    const User = require('../models/User');
    const principals = await User.find({ role: 'principal', isApproved: true });
    
    // Create notifications for all principals
    const notifications = principals.map(principal => ({
      userId: principal._id,
      visitorId: visitor._id,
      title: 'New Visitor Logged',
      message: `${name} (${contact}) - ${purpose}. Logged by ${req.user.username || req.user.fullName}`,
      type: 'visitor_logged'
    }));
    
    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Visitor logged successfully',
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/visitors
// @desc    Get all visitors (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { departmentId, startDate, endDate, search } = req.query;

    // Build query
    let query = {};

    // Role-based filtering
    if (req.user.role === 'guard') {
      query.guardId = req.user.id;
    }

    if (departmentId) {
      query.department = departmentId;
    }

    if (startDate || endDate) {
      query.timeIn = {};
      if (startDate) {
        query.timeIn.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timeIn.$lte = new Date(endDate);
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { personToMeet: { $regex: search, $options: 'i' } }
      ];
    }

    const visitors = await Visitor.find(query)
      .populate('department', 'name')
      .populate('guardId', 'username fullName')
      .sort({ timeIn: -1 })
      .limit(100);

    res.json({
      success: true,
      count: visitors.length,
      visitors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/visitors/:id
// @desc    Get single visitor
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('department', 'name')
      .populate('guardId', 'username fullName')
      .populate('assignedTo', 'username fullName');

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/visitors/:id/checkout
// @desc    Checkout visitor
// @access  Private (Guard/Admin)
router.put('/:id/checkout', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    if (visitor.timeOut) {
      return res.status(400).json({
        success: false,
        message: 'Visitor already checked out'
      });
    }

    visitor.timeOut = Date.now();
    await visitor.save();

    res.json({
      success: true,
      message: 'Visitor checked out successfully',
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
