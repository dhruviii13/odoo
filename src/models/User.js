import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  skillsOffered: [{
    type: String,
    trim: true,
    maxlength: [30, 'Skill name cannot be more than 30 characters']
  }],
  skillsWanted: [{
    type: String,
    trim: true,
    maxlength: [30, 'Skill name cannot be more than 30 characters']
  }],
  availability: {
    type: [String],
    enum: ['weekends', 'evenings', 'weekdays', 'mornings'],
    default: []
  },
  profilePublic: {
    type: Boolean,
    default: true
  },
  fcmToken: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  banUntil: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  profilePhoto: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ profilePublic: 1 });

// Virtual for skills count
userSchema.virtual('skillsCount').get(function() {
  return (this.skillsOffered?.length || 0) + (this.skillsWanted?.length || 0);
});

// Method to check if user is currently banned
userSchema.methods.isCurrentlyBanned = function() {
  if (!this.isBanned) return false;
  if (this.banUntil && new Date() > this.banUntil) {
    this.isBanned = false;
    this.banUntil = null;
    return false;
  }
  return true;
};

// Pre-save middleware to hash password (with bcryptjs)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema); 