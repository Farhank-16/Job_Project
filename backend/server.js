const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const jobRoutes     = require('./routes/jobs');
const paymentRoutes = require('./routes/payments');
const examRoutes    = require('./routes/exams');
const adminRoutes   = require('./routes/admin');
const skillRoutes   = require('./routes/skills');

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(compression());

// FIX: Increase rate limit — 100/15min is too low for development
// and even for normal app usage (dashboard loads 5+ requests at once)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.nodeEnv === 'development' ? 2000 : 500,
  message: { error: 'Too many requests, please try again later.' },
  // Skip rate limiting for static assets
  skip: (req) => req.path.startsWith('/uploads'),
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/jobs',     jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/exams',    examRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/skills',   skillRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
});

module.exports = app;