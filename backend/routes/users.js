const express = require('express');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updateData = {};

    if (name) {
      updateData.name = name;
    }
    
    if (preferences) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get meeting statistics
    const meetingStats = await Meeting.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalMeetings: { $sum: 1 },
          totalActionItems: { $sum: { $size: '$actionItems' } },
          completedActionItems: {
            $sum: {
              $size: {
                $filter: {
                  input: '$actionItems',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            }
          },
          pendingActionItems: {
            $sum: {
              $size: {
                $filter: {
                  input: '$actionItems',
                  cond: { $eq: ['$$this.status', 'pending'] }
                }
              }
            }
          },
          inProgressActionItems: {
            $sum: {
              $size: {
                $filter: {
                  input: '$actionItems',
                  cond: { $eq: ['$$this.status', 'in_progress'] }
                }
              }
            }
          }
        }
      }
    ]);

    // Get recent meetings
    const recentMeetings = await Meeting.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title meetingDate status actionItems')
      .lean();

    // Get overdue action items
    const overdueMeetings = await Meeting.find({ createdBy: userId })
      .select('title actionItems meetingDate')
      .lean();

    let overdueActionItems = 0;
    const now = new Date();
    
    overdueMeetings.forEach(meeting => {
      meeting.actionItems.forEach(item => {
        if (item.deadline && item.status !== 'completed') {
          // Simple date parsing - in production, use a proper date library
          const deadlineDate = new Date(item.deadline);
          if (deadlineDate < now) {
            overdueActionItems++;
          }
        }
      });
    });

    const stats = meetingStats[0] || {
      totalMeetings: 0,
      totalActionItems: 0,
      completedActionItems: 0,
      pendingActionItems: 0,
      inProgressActionItems: 0
    };

    res.json({
      success: true,
      data: {
        ...stats,
        overdueActionItems,
        recentMeetings,
        completionRate: stats.totalActionItems > 0 
          ? Math.round((stats.completedActionItems / stats.totalActionItems) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error fetching user statistics' });
  }
});

// @route   GET /api/users/action-items
// @desc    Get all action items for the user
// @access  Private
router.get('/action-items', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { createdBy: req.user.id };
    
    // Add status filter
    if (req.query.status) {
      filter['actionItems.status'] = req.query.status;
    }
    
    // Add priority filter
    if (req.query.priority) {
      filter['actionItems.priority'] = req.query.priority;
    }

    const meetings = await Meeting.find(filter)
      .select('title meetingDate actionItems')
      .sort({ meetingDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Flatten action items with meeting context
    let allActionItems = [];
    meetings.forEach(meeting => {
      meeting.actionItems.forEach(item => {
        allActionItems.push({
          ...item,
          meetingTitle: meeting.title,
          meetingDate: meeting.meetingDate,
          meetingId: meeting._id
        });
      });
    });

    // Apply filters to flattened data
    if (req.query.status) {
      allActionItems = allActionItems.filter(item => item.status === req.query.status);
    }
    
    if (req.query.priority) {
      allActionItems = allActionItems.filter(item => item.priority === req.query.priority);
    }

    // Sort by meeting date
    allActionItems.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

    res.json({
      success: true,
      data: allActionItems,
      pagination: {
        current: page,
        total: allActionItems.length,
        hasNext: allActionItems.length > skip + limit,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get action items error:', error);
    res.status(500).json({ message: 'Server error fetching action items' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic stats
    const stats = await Meeting.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalMeetings: { $sum: 1 },
          totalActionItems: { $sum: { $size: '$actionItems' } },
          completedActionItems: {
            $sum: {
              $size: {
                $filter: {
                  input: '$actionItems',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            }
          }
        }
      }
    ]);

    // Get recent meetings
    const recentMeetings = await Meeting.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title meetingDate status actionItems')
      .lean();

    // Get upcoming deadlines (next 7 days)
    const upcomingMeetings = await Meeting.find({ 
      createdBy: userId,
      meetingDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    .sort({ meetingDate: 1 })
    .select('title meetingDate')
    .lean();

    const result = stats[0] || {
      totalMeetings: 0,
      totalActionItems: 0,
      completedActionItems: 0
    };

    res.json({
      success: true,
      data: {
        stats: result,
        recentMeetings,
        upcomingMeetings,
        completionRate: result.totalActionItems > 0 
          ? Math.round((result.completedActionItems / result.totalActionItems) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;
