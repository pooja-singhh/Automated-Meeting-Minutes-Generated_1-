const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Meeting validation rules
const validateMeeting = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('transcript')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Transcript must be at least 10 characters long'),
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*.name')
    .trim()
    .notEmpty()
    .withMessage('Participant name is required'),
  body('meetingDate')
    .isISO8601()
    .withMessage('Please provide a valid meeting date'),
  handleValidationErrors
];

const validateActionItem = [
  body('task')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task must be between 1 and 500 characters'),
  body('person')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Person name cannot exceed 100 characters'),
  body('deadline')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Deadline cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const allowedTypes = ['text/plain', 'audio/wav', 'audio/mpeg', 'audio/mp3'];
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ 
      message: 'Invalid file type. Only TXT, WAV, and MP3 files are allowed' 
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({ 
      message: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB` 
    });
  }

  next();
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateMeeting,
  validateActionItem,
  validateFileUpload
};
