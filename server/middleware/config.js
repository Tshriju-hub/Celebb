const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');

// Security middleware
const securityMiddleware = [
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }),
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
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
