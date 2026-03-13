const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../db/connection');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Get all users (Admin only)
router.get('/', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = 'SELECT id, email, role, full_name, school_id, disability_type, approval_status, department, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can view their own profile, admins can view any profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT id, email, role, full_name, school_id, disability_type, approval_status, department, bio, profile_picture_url, phone, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (Admin only)
router.post('/', authenticateToken, checkRole('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'teacher', 'admin']),
  body('fullName').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role, fullName, schoolId, disabilityType, department, bio } = req.body;

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let query, params;

    if (role === 'student') {
      if (!schoolId || !disabilityType) {
        return res.status(400).json({ error: 'School ID and disability type required for students' });
      }
      query = `INSERT INTO users (email, password_hash, role, full_name, school_id, disability_type, approval_status)
               VALUES ($1, $2, $3, $4, $5, $6, 'approved')
               RETURNING id, email, role, full_name, school_id, disability_type, approval_status`;
      params = [email, passwordHash, role, fullName, schoolId, disabilityType];
    } else if (role === 'teacher') {
      if (!department) {
        return res.status(400).json({ error: 'Department required for teachers' });
      }
      query = `INSERT INTO users (email, password_hash, role, full_name, department, bio)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id, email, role, full_name, department`;
      params = [email, passwordHash, role, fullName, department, bio || null];
    } else {
      query = `INSERT INTO users (email, password_hash, role, full_name)
               VALUES ($1, $2, $3, $4)
               RETURNING id, email, role, full_name`;
      params = [email, passwordHash, role, fullName];
    }

    const result = await pool.query(query, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  body('fullName').optional().trim().notEmpty(),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;

    // Users can update their own profile, admins can update any profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { fullName, department, bio, phone, profilePictureUrl, currentPassword, newPassword } = req.body;

    // Handle password change
    let passwordHash = null;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }

      // Fetch the current password hash
      const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           department = COALESCE($2, department),
           bio = COALESCE($3, bio),
           phone = COALESCE($4, phone),
           profile_picture_url = COALESCE($5, profile_picture_url),
           password_hash = COALESCE($6, password_hash),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, email, role, full_name, department, bio, phone, profile_picture_url`,
      [fullName, department, bio, phone, profilePictureUrl, passwordHash, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
