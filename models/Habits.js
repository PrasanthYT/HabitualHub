const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionHistory: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  userId: {
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
habitSchema.index({ userId: 1, createdAt: -1 });

// Virtual for completion status
habitSchema.virtual('status').get(function() {
  if (!this.lastCompletedAt) return 'not-started';
  return this.isCompleted ? 'completed' : 'in-progress';
});

module.exports = mongoose.model('Habit', habitSchema);