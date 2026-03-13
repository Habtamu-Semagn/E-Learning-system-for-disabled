const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Get pending student approvals (Admin only)
router.get('/pending', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, school_id, disability_type, created_at 
       FROM users 
       WHERE role = 'student' AND approval_status = 'pending'
       ORDER BY created_at ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

// Get all student approvals with status filter (Admin only)
router.get('/', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT id, email, full_name, school_id, disability_type, approval_status, created_at 
                 FROM users 
                 WHERE role = 'student'`;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND approval_status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
});

// Approve student (Admin only)
router.post('/:id/approve', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE users 
       SET approval_status = 'approved', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role = 'student' AND approval_status = 'pending'
       RETURNING id, email, full_name, approval_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found or already processed' });
    }

    // Log audit
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'APPROVE_STUDENT', 'user', id, JSON.stringify({ status: 'approved' })]
    );

    res.json({ message: 'Student approved successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({ error: 'Failed to approve student' });
  }
});

// Reject student (Admin only)
router.post('/:id/reject', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET approval_status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role = 'student' AND approval_status = 'pending'
       RETURNING id, email, full_name, approval_status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found or already processed' });
    }

    // Log audit
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'REJECT_STUDENT', 'user', id, JSON.stringify({ status: 'rejected', reason })]
    );

    res.json({ message: 'Student rejected', user: result.rows[0] });
  } catch (error) {
    console.error('Reject student error:', error);
    res.status(500).json({ error: 'Failed to reject student' });
  }
});

module.exports = router;
