const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Get audit logs (Admin only)
router.get('/', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { userId, action, entityType, startDate, endDate, limit = 100 } = req.query;
    let query = `SELECT a.*, u.full_name, u.email, u.role
                 FROM audit_logs a
                 LEFT JOIN users u ON a.user_id = u.id
                 WHERE 1=1`;
    const params = [];

    if (userId) {
      params.push(userId);
      query += ` AND a.user_id = $${params.length}`;
    }

    if (action) {
      params.push(action);
      query += ` AND a.action = $${params.length}`;
    }

    if (entityType) {
      params.push(entityType);
      query += ` AND a.entity_type = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND a.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND a.created_at <= $${params.length}`;
    }

    query += ' ORDER BY a.created_at DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit log by ID (Admin only)
router.get('/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, u.full_name, u.email, u.role
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// Create audit log (Internal use - can be called from other routes)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { action, entityType, entityId, details } = req.body;

    const result = await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, action, entityType || null, entityId || null, details || null, req.ip]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Get audit statistics (Admin only)
router.get('/stats/summary', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND created_at <= $${params.length}`;
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action) as unique_actions,
        action,
        COUNT(*) as action_count
       FROM audit_logs
       WHERE 1=1 ${dateFilter}
       GROUP BY action
       ORDER BY action_count DESC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

module.exports = router;
