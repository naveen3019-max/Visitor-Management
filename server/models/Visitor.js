const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Visitor name is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true
  },
  photo: {
    type: String,
    required: [true, 'Visitor photo is required']
  },
  memberId: {
    type: String,
    default: null,
    trim: true
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of visit is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false,
    default: null
  },
  personToMeet: {
    type: String,
    required: false,
    default: 'N/A',
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  timeIn: {
    type: Date,
    default: Date.now
  },
  timeOut: {
    type: Date,
    default: null
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
visitorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
visitorSchema.index({ contact: 1 });
visitorSchema.index({ timeIn: -1 });
visitorSchema.index({ department: 1, timeIn: -1 });
visitorSchema.index({ guardId: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
