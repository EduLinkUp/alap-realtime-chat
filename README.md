# Alap - Real-Time Chat Application

A comprehensive real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring Socket.io for bidirectional communication and Redis for session management.

## 🚀 Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens and bcrypt password hashing
- **One-on-One Chat**: Private messaging between users with real-time delivery
- **Group Chat**: Create and manage group conversations with multiple participants
- **Real-Time Messaging**: Instant message delivery using Socket.io WebSocket connections
- **Typing Indicators**: See when other users are typing in real-time
- **Message Read Receipts**: Track message delivery and read status (sent/delivered/read)
- **Online/Offline Status**: Real-time user presence tracking
- **File & Image Sharing**: Upload and share images, videos, documents, and audio files
- **Emoji Support**: Built-in emoji picker for expressive messaging
- **Message Search**: Search through conversation history
- **Chat History with Pagination**: Efficient loading of message history
- **User Profiles**: Customizable user profiles with avatars and bios
- **Message Delivery Status**: Visual indicators for message status
- **Block Users**: Block/unblock users to control who can message you
- **Redis Session Management**: Secure session handling with Redis

### Additional Features
- **Offline Message Queue**: Messages are stored in Redis when users are offline
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Message Deletion**: Delete messages for yourself or everyone
- **Group Management**: Add/remove members, leave groups, admin controls
- **Last Seen Tracking**: View when users were last active

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd alap-realtime-chat
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Set MongoDB URI, Redis configuration, JWT secret, etc.

# Start MongoDB (if not running)
# On Windows:
mongod

# On macOS/Linux:
sudo systemctl start mongod

# Start Redis (if not running)
# On Windows:
redis-server

# On macOS/Linux:
sudo systemctl start redis

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file if needed (default settings should work for local development)

# Start the frontend development server
npm start
```

The application will open at `http://localhost:3000`

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/alap-chat

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (for production file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📁 Project Structure

```
alap-realtime-chat/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── redis.js              # Redis configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── messageController.js  # Message handling
│   │   ├── userController.js     # User management
│   │   └── groupController.js    # Group chat logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   └── upload.js             # File upload configuration
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Message.js            # Message schema
│   │   └── Group.js              # Group schema
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── messageRoutes.js      # Message routes
│   │   ├── userRoutes.js         # User routes
│   │   ├── groupRoutes.js        # Group routes
│   │   └── uploadRoutes.js       # File upload routes
│   ├── socket/
│   │   └── socketHandler.js      # Socket.io event handlers
│   ├── utils/
│   │   ├── jwt.js                # JWT utility functions
│   │   └── colors.js             # Terminal colors utility
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Main server file
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── robots.txt
    ├── src/
    │   ├── components/
    │   │   ├── MessageItem.jsx   # Message component
    │   │   ├── MessageItem.css
    │   │   ├── FileUpload.jsx    # File upload component
    │   │   └── FileUpload.css
    │   ├── context/
    │   │   ├── AuthContext.js    # Authentication context
    │   │   └── SocketContext.js  # Socket.io context
    │   ├── pages/
    │   │   ├── signin/
    │   │   │   ├── signin-new.jsx
    │   │   │   └── signin.css
    │   │   └── chatting/
    │   │       ├── chatting-new.jsx
    │   │       └── chatting.css
    │   ├── services/
    │   │   ├── api.js            # Axios configuration
    │   │   ├── authService.js    # API service functions
    │   │   └── socketService.js  # Socket.io service
    │   ├── App-new.js            # Main App component
    │   ├── App-new.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (with search)
- `GET /users/:id` - Get user by ID
- `POST /api/users/block/:userId` - Block a user
- `POST /api/users/unblock/:userId` - Unblock a user
- `GET /api/users/blocked` - Get blocked users

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get chat history with a user
- `POST /api/messages` - Send a message
- `PUT /api/messages/read/:userId` - Mark messages as read
- `DELETE /api/messages/:messageId` - Delete a message
- `GET /api/messages/search` - Search messages

### Groups
- `POST /api/groups` - Create a group
- `GET /api/groups` - Get all user's groups
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `POST /api/groups/:id/leave` - Leave group
- `GET /api/groups/:id/messages` - Get group messages
- `POST /api/groups/:id/messages` - Send group message

### File Upload
- `POST /api/upload` - Upload a file

## 🔌 Socket.io Events

### Client → Server
- `send_message` - Send a private message
- `send_group_message` - Send a group message
- `typing_start` - User starts typing
- `typing_stop` - User stops typing
- `message_read` - Mark message as read
- `change_status` - Change user status
- `join_group` - Join a group room
- `leave_group` - Leave a group room
- `get_offline_messages` - Retrieve offline messages

### Server → Client
- `receive_message` - Receive a new message
- `receive_group_message` - Receive a group message
- `message_sent` - Confirmation that message was sent
- `message_delivered` - Message delivered to recipient
- `message_read_receipt` - Message read by recipient
- `user_typing` - Another user is typing
- `user_stop_typing` - User stopped typing
- `user_online` - User came online
- `user_offline` - User went offline
- `user_status_changed` - User status changed
- `offline_messages` - Offline messages delivered
- `message_error` - Error sending message
- `message_blocked` - Message blocked (user blocked you)

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Create a new project on Railway or Render
2. Connect your GitHub repository
3. Set environment variables in the dashboard
4. Deploy the `backend` directory

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run `vercel` and follow prompts
4. Set environment variables in Vercel dashboard

### Database Hosting

- **MongoDB**: Use MongoDB Atlas (free tier available)
- **Redis**: Use Redis Cloud, Upstash, or Railway Redis

## 📚 Technologies Used

### Backend
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Redis** - Session management and caching
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **Socket.io-client** - WebSocket client
- **Axios** - HTTP client
- **React Router** - Routing
- **emoji-picker-react** - Emoji picker
- **react-icons** - Icon library
- **date-fns** - Date formatting

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Socket.io documentation
- React documentation
- MongoDB documentation
- Redis documentation
- Community contributions

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Note**: This is a capstone project demonstrating MERN stack with Socket.io for real-time communication. For production use, consider implementing additional security measures, rate limiting, input validation, and comprehensive error handling.
