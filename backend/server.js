const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const logger = require('./logger');
const pool = require('./db/connection');

const app = express();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files cross-origin
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp()); // HTTP Parameter Pollution protection
app.use(compression()); // Gzip compression for all responses

// HTTP request logging (skip /health to reduce noise)
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.url === '/health',
}));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const approvalRoutes = require('./routes/approvals');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const enrollmentRoutes = require('./routes/enrollments');
const progressRoutes = require('./routes/progress');
const quizRoutes = require('./routes/quizzes');
const feedbackRoutes = require('./routes/feedback');
const auditRoutes = require('./routes/audit');
const systemRoutes = require('./routes/system');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/system', systemRoutes);

// Health check — public, no auth required
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Health check failed', { error: err.message });
    res.status(503).json({ status: 'unhealthy', timestamp: new Date().toISOString() });
  }
});

// Root info
app.get('/', (req, res) => {
  res.json({ message: 'E-learning API is running', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method });
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV || 'development' });
});