const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/connection');
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Get all available quizzes for a student based on their enrolled courses
router.get('/available', authenticateToken, checkRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT q.*, c.title as course_title,
             (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN course_enrollments ce ON c.id = ce.course_id
      WHERE ce.student_id = $1
      ORDER BY q.created_at DESC
    `;

    const result = await pool.query(query, [studentId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get available quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch available quizzes' });
  }
});

// Get quizzes for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT q.*, 
       (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
       FROM quizzes q
       WHERE q.course_id = $1
       ORDER BY q.created_at DESC`,
      [courseId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get quiz by ID with questions
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];

    // Get questions with options
    const questionsResult = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC',
      [id]
    );

    for (let question of questionsResult.rows) {
      const optionsResult = await pool.query(
        'SELECT * FROM quiz_options WHERE question_id = $1 ORDER BY order_index ASC',
        [question.id]
      );
      question.options = optionsResult.rows;
    }

    quiz.questions = questionsResult.rows;

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Create quiz (Teacher and Admin only)
router.post('/', authenticateToken, checkRole('teacher', 'admin'), [
  body('courseId').isInt(),
  body('title').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { courseId, lessonId, title, description, passingScore, timeLimitMinutes } = req.body;

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
      `INSERT INTO quizzes (course_id, lesson_id, title, description, passing_score, time_limit_minutes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [courseId, lessonId || null, title, description || null, passingScore || 70, timeLimitMinutes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Submit quiz attempt (Student only)
router.post('/:id/attempt', authenticateToken, checkRole('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // Get quiz with questions and correct answers
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];

    // Get questions with correct answers
    const questionsResult = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1',
      [id]
    );

    let totalPoints = 0;
    let earnedPoints = 0;

    for (let question of questionsResult.rows) {
      totalPoints += question.points;

      const correctOptionsResult = await pool.query(
        'SELECT id FROM quiz_options WHERE question_id = $1 AND is_correct = true',
        [question.id]
      );

      const correctOptionIds = correctOptionsResult.rows.map(row => row.id);
      const userAnswer = answers[question.id];

      if (userAnswer && correctOptionIds.includes(parseInt(userAnswer))) {
        earnedPoints += question.points;
      }
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passing_score;

    // Save attempt
    const attemptResult = await pool.query(
      `INSERT INTO quiz_attempts (student_id, quiz_id, score, total_points, passed, answers, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.user.id, id, score, totalPoints, passed, JSON.stringify(answers)]
    );

    res.json({
      attempt: attemptResult.rows[0],
      score,
      totalPoints,
      earnedPoints,
      passed
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
});

// Get all quiz attempts for the authenticated student
router.get('/student/attempts', authenticateToken, checkRole('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    const query = `
      SELECT qa.*, q.title as quiz_title, c.category, c.title as course_title 
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qa.student_id = $1
      ORDER BY qa.started_at DESC, qa.completed_at DESC
    `;

    const result = await pool.query(query, [studentId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get student attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch student attempts' });
  }
});

// Get student quiz attempts for a specific quiz
router.get('/:id/attempts', authenticateToken, checkRole('student'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2 ORDER BY started_at DESC',
      [req.user.id, id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

module.exports = router;
