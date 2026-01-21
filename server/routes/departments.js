const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find().populate('createdBy', 'username fullName').sort({ name: 1 });
    
    res.json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', protect, authorize('principal'), async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    // Check if department exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department already exists'
      });
    }

    // Create department
    const department = await Department.create({
      name,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put('/:id', protect, authorize('principal'), async (req, res) => {
  try {
    const { name } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('principal'), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
