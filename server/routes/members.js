const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Visitor = require('../models/Visitor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/members
// @desc    Get all members
// @access  Private (Admin only)
router.get('/', protect, authorize('principal'), async (req, res) => {
  try {
    const { search, sortBy = 'visitCount' } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {
      visitCount: { visitCount: -1 },
      recent: { lastVisit: -1 },
      name: { name: 1 }
    };

    const members = await Member.find(query)
      .sort(sortOptions[sortBy] || sortOptions.visitCount)
      .limit(100);

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/members/:id/history
// @desc    Get member visit history
// @access  Private (Admin only)
router.get('/:id/history', protect, authorize('principal'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get all visits for this member (by phone)
    const visits = await Visitor.find({ contact: member.phone })
      .populate('department', 'name')
      .populate('guardId', 'username fullName')
      .sort({ timeIn: -1 })
      .limit(50);

    res.json({
      success: true,
      member,
      visits,
      count: visits.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private (Admin only)
router.put('/:id', protect, authorize('principal'), async (req, res) => {
  try {
    const { memberId, name } = req.body;

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { memberId, name },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
