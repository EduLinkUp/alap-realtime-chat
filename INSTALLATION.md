# Quick Installation Guide

This guide will help you set up and run the Alap Real-Time Chat Application on your local machine.

## Prerequisites Check

Before starting, verify you have:
- [ ] Node.js (v14+) - Run `node --version`
- [ ] MongoDB (v4.4+) - Run `mongod --version`
- [ ] Redis (v6+) - Run `redis-server --version`
- [ ] Git - Run `git --version`

## Installation Steps

### Step 1: MongoDB Setup

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
net start MongoDB
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Redis Setup

**Windows:**
```powershell
# Download from https://redis.io/download or use WSL
# Or use Docker:
docker run -d -p 6379:6379 redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Step 3: Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd alap-realtime-chat

# Install backend dependencies
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Install frontend dependencies
cd ../frontend
npm install

# Create .env file
cp .env.example .env
```

### Step 4: Configure Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alap-chat
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key_here_change_in_production
CLIENT_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Step 6: Access the Application

Open your browser and go to: `http://localhost:3000`

## Common Issues

### MongoDB Connection Error
```
Error: MongoNetworkError
```
**Solution:** Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`

### Redis Connection Error
```
Error: Redis connection failed
```
**Solution:** Ensure Redis is running: `redis-server` or `brew services start redis`

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Change PORT in backend/.env or kill the process using port 5000

### Module Not Found
```
Error: Cannot find module
```
**Solution:** Run `npm install` in both backend and frontend directories

## Testing the Application

1. **Register a New User:** Create an account with name, email, and password
2. **Login:** Sign in with your credentials
3. **Start Chatting:** Click on a user to start a conversation
4. **Send Messages:** Type and send text messages
5. **Upload Files:** Click the attachment icon to share files
6. **Create Groups:** Use the group creation feature (if implemented)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review the [PROJECT_REPORT.md](PROJECT_REPORT.md) for architecture details
- Explore the API endpoints in the README
- Customize the application for your needs

## Support

If you encounter any issues:
1. Check the error logs in the terminal
2. Verify all services (MongoDB, Redis) are running
3. Ensure all dependencies are installed
4. Review the troubleshooting section in README.md

## Production Deployment

For production deployment:
1. Use MongoDB Atlas for database
2. Use Redis Cloud or Upstash for Redis
3. Deploy backend to Railway/Render
4. Deploy frontend to Vercel
5. Set production environment variables
6. Enable HTTPS/WSS
7. Implement proper monitoring and logging

---

**Note:** This is a development setup guide. For production deployment, follow security best practices and use managed services for databases.
