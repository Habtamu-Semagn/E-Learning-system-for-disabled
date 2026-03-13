const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/connection');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Unified Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check approval status for students
    if (user.role === 'student') {
      if (user.approval_status === 'pending') {
        return res.status(403).json({ error: 'Account pending approval', status: 'pending' });
      }
      if (user.approval_status === 'rejected') {
        return res.status(403).json({ error: 'Account has been rejected', status: 'rejected' });
      }
    }

    const token = generateToken(user);
    delete user.password_hash;

    res.json({ user, token });
  } catch (error) {
    console.error('Unified login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Unified Signup
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
  body('role').isIn(['student', 'teacher'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, fullName, role, ...extraFields } = req.body;

  try {
    // Role-specific validation
    if (role === 'student') {
      const { schoolId, disabilityType } = extraFields;
      if (!schoolId || !disabilityType) {
        return res.status(400).json({ error: 'Students must provide schoolId and disabilityType' });
      }
      if (!schoolId.toUpperCase().startsWith('BDU')) {
        return res.status(400).json({ error: 'School ID must start with BDU' });
      }
    } else if (role === 'teacher') {
      const { department } = extraFields;
      if (!department) {
        return res.status(400).json({ error: 'Teachers must provide department' });
      }
      if (!email.toLowerCase().startsWith('edu')) {
        return res.status(400).json({ error: 'Teacher email must start with "edu"' });
      }
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user based on role
    let result;
    if (role === 'student') {
      const { schoolId, disabilityType } = extraFields;
      result = await pool.query(
        `INSERT INTO users (email, password_hash, role, full_name, school_id, disability_type, approval_status)
         VALUES ($1, $2, 'student', $3, $4, $5, 'pending')
         RETURNING id, email, role, full_name, approval_status`,
        [email, passwordHash, fullName, schoolId, disabilityType]
      );
    } else {
      const { department, bio } = extraFields;
      result = await pool.query(
        `INSERT INTO users (email, password_hash, role, full_name, department, bio)
         VALUES ($1, $2, 'teacher', $3, $4, $5)
         RETURNING id, email, role, full_name, department`,
        [email, passwordHash, fullName, department, bio || null]
      );
    }

    const responseData = {
      message: role === 'student' ? 'Registration successful. Awaiting approval.' : 'Registration successful',
      user: result.rows[0]
    };

    if (role === 'teacher') {
      responseData.token = generateToken(result.rows[0]);
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Unified signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});


module.exports = router;
