const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const Member = require('../models/Member');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private (Principal only)
router.get('/dashboard', protect, authorize('principal'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Visitors today
    const todayCount = await Visitor.countDocuments({
      timeIn: { $gte: today }
    });

    // Currently inside (not checked out)
    const currentlyInside = await Visitor.countDocuments({
      timeOut: null
    });

    // Weekly visitors (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = await Visitor.countDocuments({
      timeIn: { $gte: weekAgo }
    });

    // Monthly visitors (last 30 days)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyCount = await Visitor.countDocuments({
      timeIn: { $gte: monthAgo }
    });

    // Total visitors
    const totalCount = await Visitor.countDocuments();

    res.json({
      success: true,
      stats: {
        visitorsToday: todayCount,
        currentlyInside,
        weeklyVisitors: weeklyCount,
        monthlyVisitors: monthlyCount,
        totalVisitors: totalCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/analytics/weekly
// @desc    Get weekly visitor analysis
// @access  Private (Principal only)
router.get('/weekly', protect, authorize('principal'), async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyData = await Visitor.aggregate([
      {
        $match: {
          timeIn: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timeIn' }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: weeklyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/analytics/monthly
// @desc    Get monthly visitor analysis
// @access  Private (Principal only)
router.get('/monthly', protect, authorize('principal'), async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Visitor.aggregate([
      {
        $match: {
          timeIn: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$timeIn' }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/analytics/departments
// @desc    Get department-wise visitor distribution
// @access  Private (Principal only)
router.get('/departments', protect, authorize('principal'), async (req, res) => {
  try {
    const departmentData = await Visitor.aggregate([
      {
        $group: {
          _id: '$department',
          totalVisits: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      {
        $unwind: '$departmentInfo'
      },
      {
        $project: {
          departmentName: '$departmentInfo.name',
          totalVisits: 1
        }
      },
      {
        $sort: { totalVisits: -1 }
      }
    ]);

    res.json({
      success: true,
      data: departmentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/analytics/members
// @desc    Get member visit tracking
// @access  Private (Principal only)
router.get('/members', protect, authorize('principal'), async (req, res) => {
  try {
    // Total unique members
    const totalMembers = await Member.countDocuments();

    // New members this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const newMembersThisMonth = await Member.countDocuments({
      memberSince: { $gte: monthStart }
    });

    // Top frequent visitors
    const topVisitors = await Member.find()
      .sort({ visitCount: -1 })
      .limit(10)
      .select('name phone visitCount lastVisit');

    // Member visit trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const memberTrend = await Member.aggregate([
      {
        $match: {
          memberSince: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$memberSince' }
          },
          newMembers: { $sum: 1 },
          autoDetected: {
            $sum: { $cond: ['$isAutoDetected', 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalMembers,
        newMembersThisMonth,
        topVisitors,
        memberTrend
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
