import mongoose from 'mongoose';

const globalNoticeSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  priority: {
    type: String,
    enum: ['info', 'warning', 'error'],
    default: 'info'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin user is required']
  },
  fcmSent: {
    type: Boolean,
    default: false
  },
  fcmSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
globalNoticeSchema.index({ isActive: 1, priority: 1 });
globalNoticeSchema.index({ startDate: 1, endDate: 1 });
globalNoticeSchema.index({ createdAt: -1 });

// Virtual to check if notice is currently active
globalNoticeSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
});

// Method to get active notices
globalNoticeSchema.statics.getActiveNotices = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { startDate: { $lte: now } },
      { startDate: { $exists: false } }
    ],
    $or: [
      { endDate: { $gt: now } },
      { endDate: { $exists: false } }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

export default mongoose.models.GlobalNotice || mongoose.model('GlobalNotice', globalNoticeSchema); 