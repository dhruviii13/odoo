import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'From user is required']
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'To user is required']
  },
  offeredSkill: {
    type: String,
    required: [true, 'Offered skill is required'],
    trim: true,
    maxlength: [30, 'Skill name cannot be more than 30 characters']
  },
  requestedSkill: {
    type: String,
    required: [true, 'Requested skill is required'],
    trim: true,
    maxlength: [30, 'Skill name cannot be more than 30 characters']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
swapSchema.index({ fromUser: 1, toUser: 1 });
swapSchema.index({ status: 1 });
swapSchema.index({ createdAt: -1 });
swapSchema.index({ fromUser: 1, status: 1 });
swapSchema.index({ toUser: 1, status: 1 });

// Compound index to prevent duplicate active requests
swapSchema.index({ fromUser: 1, toUser: 1, status: 1 }, { unique: true });

// Virtual for skill pair display
swapSchema.virtual('skillPair').get(function() {
  return `${this.offeredSkill} ↔ ${this.requestedSkill}`;
});

// Method to check if swap is active
swapSchema.methods.isActive = function() {
  return this.status === 'pending';
};

// Pre-save middleware to update timestamps
swapSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'accepted') {
      this.acceptedAt = now;
    } else if (this.status === 'rejected') {
      this.rejectedAt = now;
    } else if (this.status === 'cancelled') {
      this.cancelledAt = now;
    }
  }
  next();
});

export default mongoose.models.Swap || mongoose.model('Swap', swapSchema); 