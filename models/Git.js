const mongoose = require('mongoose');

const gitGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repoId: {
    type: String,
    required: true
  },
  repoName: {
    type: String,
    required: true
  },
  goalName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  repoDetails: {
    visibility: String,
    stars: Number,
    forks: Number,
    lastUpdate: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
gitGoalSchema.index({ userId: 1, repoId: 1 });
gitGoalSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('GitGoal', gitGoalSchema);