const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/connection');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Get lessons for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC',
      [courseId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get lesson by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Create lesson (Teacher and Admin only)
router.post('/', authenticateToken, checkRole('teacher', 'admin'), [
  body('courseId').isInt(),
  body('title').trim().notEmpty(),
  body('orderIndex').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId, title, description, content, videoUrl, orderIndex, durationMinutes } = req.body;

  try {
    // Check course ownership for teachers
    if (req.user.role === 'teacher') {
      const ownerCheck = await pool.query(
        'SELECT teacher_id FROM courses WHERE id = $1',
        [courseId]
      );
      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [courseId, title, description || null, content || null, videoUrl || null, orderIndex, durationMinutes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.put('/:id', authenticateToken, checkRole('teacher', 'admin'), [
  body('title').optional().trim().notEmpty(),
  body('orderIndex').optional().isInt(),
  body('durationMinutes').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const { title, description, content, videoUrl, orderIndex, durationMinutes } = req.body;

    // Check course ownership for teachers
    if (req.user.role === 'teacher') {
      const ownerCheck = await pool.query(
        `SELECT c.teacher_id FROM courses c
         JOIN lessons l ON c.id = l.course_id
         WHERE l.id = $1`,
        [id]
      );
      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query(
      `UPDATE lessons 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           content = COALESCE($3, content),
           video_url = COALESCE($4, video_url),
           order_index = COALESCE($5, order_index),
           duration_minutes = COALESCE($6, duration_minutes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, content, videoUrl, orderIndex, durationMinutes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson
router.delete('/:id', authenticateToken, checkRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check course ownership for teachers
    if (req.user.role === 'teacher') {
      const ownerCheck = await pool.query(
        `SELECT c.teacher_id FROM courses c
         JOIN lessons l ON c.id = l.course_id
         WHERE l.id = $1`,
        [id]
      );
      if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].teacher_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

module.exports = router;
