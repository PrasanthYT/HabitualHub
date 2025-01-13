const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  mood: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ title: 'text' });

module.exports = mongoose.model('Journal', journalSchema);