<<<<<<< HEAD
# AMMG - Automated Meeting Minutes Generator

A professional MERN stack application that uses AI to automatically generate meeting minutes from audio files or transcripts.

## 🚀 Features

- **Audio Transcription**: Upload MP3, WAV, or M4A files for automatic transcription
- **AI Summarization**: Generate concise meeting summaries using advanced NLP
- **Action Item Extraction**: Automatically identify tasks, deadlines, and responsible parties
- **Participant Recognition**: Detect and organize meeting participants
- **Professional Minutes**: Generate well-formatted meeting minutes ready for distribution
- **User Management**: Secure authentication and user profiles
- **Meeting Analytics**: Track productivity and completion rates
- **Responsive Design**: Modern, mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### AI Services
- **OpenAI Whisper** - Audio transcription
- **Hugging Face Transformers** - Text summarization
- **spaCy** - NLP processing
- **Custom NLP** - Action item extraction

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ammg-mern
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ammg
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Full Stack Development

To run both frontend and backend simultaneously:

```bash
# From the root directory
npm run dev
```

## 🚀 Quick Start

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
ammg-mern/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   └── server.js        # Express server
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── package.json
├── uploads/             # File upload directory
├── package.json         # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting by ID
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `GET /api/meetings/stats/overview` - Get meeting statistics

### File Upload
- `POST /api/upload/file` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete file
- `GET /api/upload/:filename` - Download file

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/dashboard` - Get dashboard data

## 🎨 UI Components

The application includes a comprehensive set of reusable components:

- **Layout** - Main application layout with sidebar
- **LoadingSpinner** - Loading indicators
- **ProtectedRoute** - Route protection
- **Form Components** - Input, button, and form elements
- **Card Components** - Content containers
- **Badge Components** - Status indicators

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create ammg-backend
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Netlify)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Set environment variables for API URL

### Docker Deployment

1. **Build Docker images**
   ```bash
   docker build -t ammg-backend ./backend
   docker build -t ammg-frontend ./frontend
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm run test:all
```

## 📊 Performance Optimization

- React Query for efficient data fetching
- Image optimization and lazy loading
- Code splitting and lazy loading
- MongoDB indexing for faster queries
- Compression middleware
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- Real-time collaboration features
- Advanced analytics and reporting
- Integration with calendar applications
- Mobile app development
- Voice commands and shortcuts
- Multi-language support
- Advanced AI models integration

---

**AMMG** - Making meetings more productive, one minute at a time! 🎯
=======
# Automated-Meeting-Minutes-Generated_1-
>>>>>>> 30e041d52b0c3b4bf2fac31e50b791cbc5154343
