const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

// Disable mongoose buffering globally BEFORE any model imports
mongoose.set('bufferCommands', false);

const app = express();

// Enhanced CORS configuration for development
if (isDevelopment) {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
  }));
} else {
  app.use(cors());
}

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// MongoDB connection with enhanced error handling and retry logic
const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increased to 30s for slow networks
      socketTimeoutMS: 60000, // Keep at 60s
      connectTimeoutMS: 30000, // Increased to 30s for initial connection
      maxPoolSize: 10, // Increased for multiple users
      minPoolSize: 2, // Minimum connections
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true, // Enable retry writes
      retryReads: true, // Enable retry reads
      heartbeatFrequencyMS: 30000, // Heartbeat every 30 seconds
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      // Additional options for better reliability
      compressors: 'snappy,zlib', // Enable compression
      readPreference: 'primaryPreferred', // Prefer primary but allow secondary reads
      w: 'majority', // Write concern for durability
      journal: true, // Enable journaling
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log('🔧 Enhanced connection settings applied');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
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
    
    if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
      console.error('🌐 Network Issue: Please check your internet connection');
    }
    
    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying connection (${retryCount + 1}/${maxRetries}) in 5 seconds...`);
      setTimeout(() => {
        connectDB(retryCount + 1);
      }, 5000);
    } else {
      console.error('❌ Max connection retries reached. App will continue with degraded functionality.');
    }
  }
};

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./backend/routes/auth');
const excelRoutes = require('./backend/routes/excel');

// Enhanced database connection middleware
const checkDbConnection = async (req, res, next) => {
  const dbState = mongoose.connection.readyState;
  
  if (dbState !== 1) {
    console.error(`❌ Database not ready (state: ${dbState}), rejecting request`);
    console.error('Database states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    // If connecting, wait a short time
    if (dbState === 2) {
      console.log('⏳ Database connecting, waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check again after waiting
      if (mongoose.connection.readyState === 1) {
        console.log('✅ Database connection verified after wait');
        next();
        return;
      }
    }
    
    return res.status(503).json({ 
      message: 'Database connection not available. Please try again in a moment.',
      status: 'service_unavailable',
      dbState: dbState,
      hint: 'If this persists, there may be a network connectivity issue.'
    });
  }
  
  console.log('✅ Database connection verified for request');
  next();
};

// API routes with database connection check
app.use('/api/auth', checkDbConnection, authRoutes);
app.use('/api/excel', checkDbConnection, excelRoutes);

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
app.get('/api/db-test', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting', 
      3: 'disconnecting'
    };
    
    const startTime = Date.now();
    let testResult = {};
    
    if (dbStatus === 1) {
      try {
        // Test database query
        const User = require('./backend/models/User');
        const testQuery = await User.countDocuments().maxTimeMS(5000);
        const queryTime = Date.now() - startTime;
        
        testResult = {
          success: true,
          queryTime: `${queryTime}ms`,
          userCount: testQuery,
          message: 'Database query successful'
        };
      } catch (queryError) {
        testResult = {
          success: false,
          error: queryError.message,
          message: 'Database query failed'
        };
      }
    } else {
      testResult = {
        success: false,
        message: 'Database not connected'
      };
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      database: {
        status: dbStates[dbStatus],
        name: mongoose.connection.name || 'not connected',
        host: mongoose.connection.host || 'not connected',
        readyState: dbStatus
      },
      test: testResult,
      server: {
        port: PORT,
        uptime: `${Math.floor(process.uptime())}s`,
        nodeVersion: process.version
      },
      troubleshooting: {
        tips: [
          'Check internet connection',
          'Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0',
          'Confirm database user credentials',
          'Check MongoDB Atlas cluster status',
          'Try accessing from different network/location'
        ],
        commonErrors: {
          'MongoServerSelectionError': 'Cannot reach MongoDB server - check network/IP whitelist',
          'MongoTimeoutError': 'Query took too long - check connection speed',
          'MongoNetworkError': 'Network connectivity issue',
          'MongoAuthenticationError': 'Invalid database credentials'
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
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
// Always serve static files for unified server approach
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on port ${PORT}`);
  console.log(` Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🏗️  Architecture: Unified (Frontend + Backend)`);
});
