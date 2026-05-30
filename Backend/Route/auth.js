const express = require('express');
const router = express.Router();
const User = require('../Model/user');
const passport = require('passport');

// Email/Password Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: email, $options: 'i' } });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Log user in with passport
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Login failed' });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        credits: req.user.credits,
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Update current user profile
router.put('/update', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ success: false, message: 'Name or email is required' });
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    if (name) req.user.name = name;
    if (email) req.user.email = email;

    await req.user.save();

    req.login(req.user, (err) => {
      if (err) {
        console.error('Re-login after profile update failed:', err);
        return res.status(500).json({ success: false, message: 'Profile update failed' });
      }

      res.json({ success: true, user: req.user });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login failed route
router.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Login failed'
  });
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL || 'https://stack-saas.vercel.app',
    failureRedirect: '/login/failed'
  })
);

// Login success check
router.get('/login/success', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      error: false,
      message: 'Successfully logged in',
      user: req.user
    });
  } else {
    res.status(403).json({
      error: true,
      message: 'Not authorized'
    });
  }
});

module.exports = router;