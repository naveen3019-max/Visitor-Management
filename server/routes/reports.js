const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { generateVisitorReport } = require('../utils/pdfGenerator');
const { generateVisitorCSV } = require('../utils/csvGenerator');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');

// @route   POST /api/reports/pdf
// @desc    Generate PDF report
// @access  Private (Admin only)
router.post('/pdf', protect, authorize('principal'), async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.body;

    // Build query
    let query = {};
    if (startDate || endDate) {
      // Use $or to check both timeIn and createdAt
      const dateConditions = [];
      if (startDate && endDate) {
        dateConditions.push({
          $or: [
            { timeIn: { $gte: new Date(startDate), $lte: new Date(endDate) } },
            { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
          ]
        });
      } else if (startDate) {
        dateConditions.push({
          $or: [
            { timeIn: { $gte: new Date(startDate) } },
            { createdAt: { $gte: new Date(startDate) } }
          ]
        });
      } else if (endDate) {
        dateConditions.push({
          $or: [
            { timeIn: { $lte: new Date(endDate) } },
            { createdAt: { $lte: new Date(endDate) } }
          ]
        });
      }
      if (dateConditions.length > 0) {
        query.$and = dateConditions;
      }
    }
    if (departmentId) query.department = departmentId;

    // Fetch visitors
    const visitors = await Visitor.find(query)
      .populate('department', 'name')
      .populate('guardId', 'username fullName')
      .sort({ timeIn: -1, createdAt: -1 });

    if (visitors.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No visitors found for the specified criteria. Try adjusting your filters.'
      });
    }

    // Generate PDF
    const filename = `visitor-report-${Date.now()}.pdf`;
    const filePath = await generateVisitorReport(visitors, filename);

    // Send file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        try {
          require('fs').unlinkSync(filePath);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/reports/csv
// @desc    Generate CSV report
// @access  Private (Admin only)
router.post('/csv', protect, authorize('principal'), async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.body;

    // Build query
    let query = {};
    if (startDate || endDate) {
      // Use $or to check both timeIn and createdAt
      const dateConditions = [];
      if (startDate && endDate) {
        dateConditions.push({
          $or: [
            { timeIn: { $gte: new Date(startDate), $lte: new Date(endDate) } },
            { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
          ]
        });
      } else if (startDate) {
        dateConditions.push({
          $or: [
            { timeIn: { $gte: new Date(startDate) } },
            { createdAt: { $gte: new Date(startDate) } }
          ]
        });
      } else if (endDate) {
        dateConditions.push({
          $or: [
            { timeIn: { $lte: new Date(endDate) } },
            { createdAt: { $lte: new Date(endDate) } }
          ]
        });
      }
      if (dateConditions.length > 0) {
        query.$and = dateConditions;
      }
    }
    if (departmentId) query.department = departmentId;

    // Fetch visitors
    const visitors = await Visitor.find(query)
      .populate('department', 'name')
      .populate('guardId', 'username fullName')
      .sort({ timeIn: -1, createdAt: -1 });

    if (visitors.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No visitors found for the specified criteria. Try adjusting your filters.'
      });
    }

    // Generate CSV
    const filename = `visitor-report-${Date.now()}.csv`;
    const filePath = await generateVisitorCSV(visitors, filename);

    // Send file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        try {
          require('fs').unlinkSync(filePath);
        } catch (e) {
          console.error('Error deleting file:', e);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('CSV generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
