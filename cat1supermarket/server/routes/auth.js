const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  
  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      token
    });
  });
});

// Register
router.post('/register', (req, res) => {
  const { username, password, role = 'customer' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  // Password validation rules
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return res.status(400).json({
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Check if user exists
  db.get('SELECT id FROM users WHERE username = ?', [username], async (err, existingUser) => {
    if (err) {
      console.error('Database error during registration:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role],
        function(err) {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          res.json({
            success: true,
            message: 'User registered successfully'
          });
        }
      );
    } catch (hashError) {
      console.error('Password hash error:', hashError);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
});

// Get current user info
router.get('/me', (req, res) => {
  const { authenticateToken } = require('../middleware/auth');
  authenticateToken(req, res, () => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    });
  });
});

module.exports = router;

