const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  visitCount: {
    type: Number,
    default: 1
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  isAutoDetected: {
    type: Boolean,
    default: false
  }
});

// Indexes for performance
memberSchema.index({ phone: 1 });
memberSchema.index({ memberId: 1 });
memberSchema.index({ visitCount: -1 });

module.exports = mongoose.model('Member', memberSchema);
