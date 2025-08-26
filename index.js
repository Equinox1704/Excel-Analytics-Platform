const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Disable mongoose buffering globally BEFORE any model imports
mongoose.set('bufferCommands', false);

const app = express();

// CORS configuration
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Reduced from 10s to 5s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false // Disable mongoose buffering
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log('🔧 Buffering disabled globally');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Check for specific error types
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('🚫 IP Whitelist Issue: Please add your current IP to MongoDB Atlas whitelist');
      console.error('🔗 Visit: https://cloud.mongodb.com/v2/projectId/security/network/accessList');
    }
    
    if (error.message.includes('authentication')) {
      console.error('🔐 Authentication Issue: Please check your username and password');
    }
    
    // Don't exit the process, let it retry
    console.log('🔄 Will retry connection when needed...');
  }
};

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./backend/routes/auth');

// Database connection middleware
const checkDbConnection = (req, res, next) => {
  const dbState = mongoose.connection.readyState;
  
  if (dbState !== 1) {
    console.error(`❌ Database not ready (state: ${dbState}), rejecting request`);
    console.error('Database states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    return res.status(503).json({ 
      message: 'Database connection not available',
      status: 'service_unavailable',
      dbState: dbState
    });
  }
  
  console.log('✅ Database connection verified for request');
  next();
};

// API routes with database connection check
app.use('/api/auth', checkDbConnection, authRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting', 
      3: 'disconnecting'
    };
    
    const isDbConnected = dbStatus === 1;
    
    res.status(isDbConnected ? 200 : 503).json({
      status: isDbConnected ? 'healthy' : 'unhealthy',
      database: {
        status: dbStates[dbStatus],
        name: mongoose.connection.name || 'not connected'
      },
      server: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        port: PORT
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Unified server is working!', 
    port: PORT,
    timestamp: new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    architecture: 'unified'
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('🧪 Starting database test...');
    console.log('📊 DB State:', mongoose.connection.readyState);
    console.log('📊 DB Name:', mongoose.connection.name);
    
    // Import User model for testing
    const User = require('./backend/models/User');
    console.log('✅ User model imported successfully');
    
    // Test with timeout
    const userCount = await User.countDocuments().maxTimeMS(5000);
    console.log(`📊 Found ${userCount} users in database`);
    
    // Test findOne operation
    const testUser = await User.findOne().maxTimeMS(5000);
    console.log('✅ FindOne operation successful');
    
    res.json({
      message: 'Database connection successful!',
      userCount: userCount,
      hasUsers: userCount > 0,
      dbName: mongoose.connection.name,
      dbState: mongoose.connection.readyState,
      bufferingDisabled: !mongoose.get('bufferCommands'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      message: 'Database test failed',
      error: error.message,
      errorType: error.constructor.name,
      dbState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🏗️  Architecture: Unified (Frontend + Backend)`);
});
