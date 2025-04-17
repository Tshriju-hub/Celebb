const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');

// Security middleware
const securityMiddleware = [
  helmet(),
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
];

// Logging middleware
const loggingMiddleware = [
  morgan('dev')
];

// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
};

module.exports = {
  securityMiddleware,
  loggingMiddleware,
  errorMiddleware
};
