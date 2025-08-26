const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('🔍 Checking if user already exists:', email);
    
    const existingUser = await User.findOne({ email })
      .maxTimeMS(5000)
      .setOptions({ bufferCommands: false });
      
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    console.log('✅ Creating new user:', username, email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    
    await user.save({ bufferCommands: false, maxTimeMS: 5000 });
    console.log('✅ User saved to database');
    
    // Send welcome email
    console.log('📧 Sending welcome email...');
    const emailResult = await sendWelcomeEmail(email, username);
    
    if (emailResult.success) {
      console.log('✅ Welcome email sent successfully');
    } else {
      console.warn('⚠️ Welcome email failed to send:', emailResult.error);
      // Don't fail registration if email fails
    }
    
    res.status(201).json({ 
      message: 'User registered successfully',
      emailSent: emailResult.success 
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again.',
        error: 'Database temporarily unavailable'
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email })
      .maxTimeMS(5000)
      .setOptions({ bufferCommands: false });
      
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again.',
        error: 'Database temporarily unavailable'
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('🔍 Looking for user with email:', email);
    
    // Add explicit timeout and no buffering
    const user = await User.findOne({ email })
      .maxTimeMS(5000)
      .setOptions({ bufferCommands: false });
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found, generating OTP');
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpires;
    
    // Save with timeout and no buffering
    await user.save({ bufferCommands: false, maxTimeMS: 5000 });
    console.log('✅ User updated with OTP');

    console.log('📧 Sending OTP email...');
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send OTP email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    console.log('✅ OTP sent successfully');
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    
    // Provide more specific error messages
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again.',
        error: 'Database temporarily unavailable'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    })
    .maxTimeMS(5000)
    .setOptions({ bufferCommands: false });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again.',
        error: 'Database temporarily unavailable'
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    })
    .maxTimeMS(5000)
    .setOptions({ bufferCommands: false });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save({ bufferCommands: false, maxTimeMS: 5000 });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection timeout. Please try again.',
        error: 'Database temporarily unavailable'
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
