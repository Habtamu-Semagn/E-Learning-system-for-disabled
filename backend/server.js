const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp()); // HTTP Parameter Pollution protection

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

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'E-learning API is running', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});