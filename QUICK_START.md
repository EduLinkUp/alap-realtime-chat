# Quick Start Guide

## Option 1: Using MongoDB Atlas (Recommended - No Installation Required)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new cluster (Choose free M0 tier)

2. **Configure Database Access**
   - In Atlas dashboard, go to "Database Access"
   - Add a new database user with username and password
   - Remember the credentials!

3. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/alap-chat`

5. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.xxxxx.mongodb.net/alap-chat
   ```

6. **Start the Server**
   ```bash
   cd backend
   npm run dev
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically
4. Use default connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/alap-chat
   ```

### Mac:
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Redis Setup (Optional)

Redis is optional for this application. Leave the Redis settings empty in `.env` to continue without it.

If you want to use Redis:
- **Cloud Redis**: Sign up at https://redis.com/try-free/ and get connection URL
- **Local Redis (Windows)**: Use Docker or WSL

## Verify Setup

1. Backend server should start on http://localhost:5000
2. You should see:
   - ✅ MongoDB Connected: [your-cluster-name]
   - ✅ Redis not configured - session management will use in-memory store (or Redis Client Connected)
   - ✅ Server running in development mode on port 5000

## Start Frontend

In a new terminal:
```bash
cd frontend
npm install
npm start
```

The app will open at http://localhost:3000

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB service is running
- Verify connection string in `.env`
- For Atlas: Check network access and user credentials

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 5001)

### Module Not Found
- Run `npm install` in both backend and frontend folders
