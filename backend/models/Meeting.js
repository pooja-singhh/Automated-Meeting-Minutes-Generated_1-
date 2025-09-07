const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, 'Action item task is required'],
    trim: true
  },
  person: {
    type: String,
    trim: true
  },
  deadline: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true
  }
});

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  transcript: {
    type: String,
    required: [true, 'Meeting transcript is required']
  },
  summary: {
    type: String,
    required: [true, 'Meeting summary is required']
  },
  participants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      trim: true
    }
  }],
  actionItems: [actionItemSchema],
  meetingDate: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  aiMetadata: {
    modelUsed: String,
    processingTime: Number,
    confidence: Number,
    language: {
      type: String,
      default: 'en'
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    lastAccessed: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
meetingSchema.index({ createdBy: 1, createdAt: -1 });
meetingSchema.index({ meetingDate: -1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ tags: 1 });
meetingSchema.index({ 'participants.email': 1 });

// Virtual for formatted meeting date
meetingSchema.virtual('formattedDate').get(function() {
  return this.meetingDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to update analytics
meetingSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastAccessed = new Date();
  return this.save();
};

meetingSchema.methods.incrementDownloads = function() {
  this.analytics.downloads += 1;
  return this.save();
};

// Method to get action items by status
meetingSchema.methods.getActionItemsByStatus = function(status) {
  return this.actionItems.filter(item => item.status === status);
};

// Method to get overdue action items
meetingSchema.methods.getOverdueActionItems = function() {
  const now = new Date();
  return this.actionItems.filter(item => {
    if (!item.deadline || item.status === 'completed') return false;
    
    // Simple date parsing - in production, use a proper date library
    const deadlineDate = new Date(item.deadline);
    return deadlineDate < now && item.status !== 'completed';
  });
};

module.exports = mongoose.model('Meeting', meetingSchema);
