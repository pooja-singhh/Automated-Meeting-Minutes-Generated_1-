const express = require('express');
const Meeting = require('../models/Meeting');
const { protect, authorize } = require('../middleware/auth');
const { validateMeeting, validateActionItem } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/meetings
// @desc    Get all meetings for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { createdBy: req.user.id };
    
    // Add search filter
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { summary: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }
    
    // Add status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Add date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.meetingDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const meetings = await Meeting.find(filter)
      .sort({ meetingDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean();

    const total = await Meeting.countDocuments(filter);

    res.json({
      success: true,
      data: meetings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
});

// @route   GET /api/meetings/:id
// @desc    Get a single meeting
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('team', 'name');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has access to this meeting
    if (meeting.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this meeting' });
    }

    // Update view count
    await meeting.incrementViews();

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error fetching meeting' });
  }
});

// @route   POST /api/meetings
// @desc    Create a new meeting
// @access  Private
router.post('/', protect, validateMeeting, async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      createdBy: req.user.id
    };

    const meeting = await Meeting.create(meetingData);
    await meeting.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
});

// @route   PUT /api/meetings/:id
// @desc    Update a meeting
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has permission to update
    if (meeting.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      data: updatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Server error updating meeting' });
  }
});

// @route   DELETE /api/meetings/:id
// @desc    Delete a meeting
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has permission to delete
    if (meeting.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Server error deleting meeting' });
  }
});

// @route   POST /api/meetings/:id/action-items
// @desc    Add action item to meeting
// @access  Private
router.post('/:id/action-items', protect, validateActionItem, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has permission
    if (meeting.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this meeting' });
    }

    meeting.actionItems.push(req.body);
    await meeting.save();

    res.status(201).json({
      success: true,
      data: meeting.actionItems[meeting.actionItems.length - 1]
    });
  } catch (error) {
    console.error('Add action item error:', error);
    res.status(500).json({ message: 'Server error adding action item' });
  }
});

// @route   PUT /api/meetings/:id/action-items/:actionId
// @desc    Update action item
// @access  Private
router.put('/:id/action-items/:actionId', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has permission
    if (meeting.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this meeting' });
    }

    const actionItem = meeting.actionItems.id(req.params.actionId);
    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    Object.assign(actionItem, req.body);
    await meeting.save();

    res.json({
      success: true,
      data: actionItem
    });
  } catch (error) {
    console.error('Update action item error:', error);
    res.status(500).json({ message: 'Server error updating action item' });
  }
});

// @route   DELETE /api/meetings/:id/action-items/:actionId
// @desc    Delete action item
// @access  Private
router.delete('/:id/action-items/:actionId', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has permission
    if (meeting.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this meeting' });
    }

    meeting.actionItems.id(req.params.actionId).remove();
    await meeting.save();

    res.json({
      success: true,
      message: 'Action item deleted successfully'
    });
  } catch (error) {
    console.error('Delete action item error:', error);
    res.status(500).json({ message: 'Server error deleting action item' });
  }
});

// @route   GET /api/meetings/stats/overview
// @desc    Get meeting statistics
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
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
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMeetings: 0,
      totalActionItems: 0,
      completedActionItems: 0,
      pendingActionItems: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

module.exports = router;
