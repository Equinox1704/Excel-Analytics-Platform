const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔒 Auth middleware - checking token for:', req.method, req.originalUrl);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        message: 'Access token required',
        code: 'NO_TOKEN' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log('❌ Token verification error:', err.message);
        return res.status(403).json({ 
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN' 
        });
      }

      try {
        console.log('✅ Token valid, finding user:', decoded.id);
        // Get user from database with enhanced timeout handling
        const user = await User.findById(decoded.id)
          .select('-password')
          .maxTimeMS(3000) // Reduced to 3 seconds for faster response
          .setOptions({ bufferCommands: false })
          .lean(); // Use lean() for better performance

        if (!user) {
          console.log('❌ User not found:', decoded.id);
          return res.status(404).json({ 
            message: 'User not found',
            code: 'USER_NOT_FOUND' 
          });
        }

        console.log('✅ User found:', user.email);
        // Standardize auth context
        req.auth = { userId: user._id.toString() };
        // Keep a minimal safe user object
        req.user = {
          id: user._id.toString(),
          username: user.username,
          email: user.email
        };
        next();
      } catch (dbError) {
        console.error('❌ Database error in auth middleware:', dbError);
        
        // Handle specific database errors
        if (dbError.name === 'MongoNetworkTimeoutError' || 
            dbError.name === 'MongoServerSelectionError' ||
            dbError.message.includes('timeout')) {
          return res.status(503).json({ 
            message: 'Database temporarily unavailable. Please try again.',
            code: 'DB_TIMEOUT' 
          });
        }
        
        return res.status(500).json({ 
          message: 'Authentication failed',
          code: 'AUTH_ERROR' 
        });
      }
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      code: 'SERVER_ERROR' 
    });
  }
};

module.exports = authenticateToken;
