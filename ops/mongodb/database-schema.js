/**
 * DATABASE SCHEMA DEFINITIONS
 * MongoDB Schemas for Task Manager Application
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================
// USER SCHEMA
// ============================================

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days in seconds
    }
  }],
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    defaultView: {
      type: String,
      enum: ['list', 'grid', 'kanban'],
      default: 'list'
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for task count
userSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'userId',
  count: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ============================================
// TASK SCHEMA
// ============================================

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'completed', 'archived'],
      message: '{VALUE} is not a valid status'
    },
    default: 'todo',
    index: true
  },
  
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium',
    index: true
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  dueDate: {
    type: Date,
    default: null,
    index: true
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number, // bytes
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  reminders: [{
    reminderDate: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ userId: 1, status: 1, priority: -1, dueDate: 1 }); // Compound for filtering

// Text index for search
taskSchema.index({ title: 'text', description: 'text' });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return this.dueDate < new Date();
});

// Virtual for completion percentage (based on subtasks)
taskSchema.virtual('completionPercentage').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  const completed = this.subtasks.filter(st => st.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Auto-set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Clear completedAt if status changes from completed
  if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
    this.completedAt = null;
  }
  
  next();
});

// ============================================
// CATEGORY SCHEMA
// ============================================

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  
  color: {
    type: String,
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color'],
    default: '#3B82F6' // Blue
  },
  
  icon: {
    type: String,
    default: 'folder'
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique index: one category name per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

// Virtual for task count in this category
categorySchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// ============================================
// ACTIVITY LOG SCHEMA
// ============================================

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
    index: true
  },
  
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'completed', 'archived', 'restored'],
    required: true
  },
  
  entityType: {
    type: String,
    enum: ['task', 'category', 'user'],
    default: 'task'
  },
  
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  ipAddress: String,
  userAgent: String
}, {
  timestamps: false // We use custom timestamp field
});

// Compound indexes
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ taskId: 1, timestamp: -1 });

// TTL index - auto-delete logs after 90 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// ============================================
// NOTIFICATION SCHEMA
// ============================================

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  
  type: {
    type: String,
    enum: ['reminder', 'deadline', 'shared', 'completed', 'overdue'],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: Date,
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

// TTL index - auto-delete read notifications after 30 days
notificationSchema.index(
  { readAt: 1 },
  { expireAfterSeconds: 2592000, partialFilterExpression: { isRead: true } }
);

// ============================================
// EXPORT MODELS
// ============================================

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Category = mongoose.model('Category', categorySchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  User,
  Task,
  Category,
  ActivityLog,
  Notification
};

// ============================================
// DATABASE INITIALIZATION SCRIPT
// ============================================

/**
 * Create default categories for a user
 */
async function createDefaultCategories(userId) {
  const defaultCategories = [
    { name: 'Personal', color: '#3B82F6', icon: 'person', isDefault: true },
    { name: 'Work', color: '#EF4444', icon: 'work', isDefault: true },
    { name: 'Shopping', color: '#10B981', icon: 'shopping_cart', isDefault: true },
    { name: 'Health', color: '#F59E0B', icon: 'favorite', isDefault: true },
    { name: 'Learning', color: '#8B5CF6', icon: 'school', isDefault: true }
  ];
  
  const categories = defaultCategories.map(cat => ({
    ...cat,
    userId
  }));
  
  await Category.insertMany(categories);
}

/**
 * Create indexes for all collections
 */
async function createIndexes() {
  await User.createIndexes();
  await Task.createIndexes();
  await Category.createIndexes();
  await ActivityLog.createIndexes();
  await Notification.createIndexes();
  console.log('All indexes created successfully');
}

module.exports.createDefaultCategories = createDefaultCategories;
module.exports.createIndexes = createIndexes;
