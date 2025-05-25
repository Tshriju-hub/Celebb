const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/config');
const cors = require('cors');
const {
  securityMiddleware,
  loggingMiddleware,
  errorMiddleware
} = require('./middleware/config');
const { app, server } = require('./socket/socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviews');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analyticsRoutes');
const serviceImagesRoutes = require('./routes/serviceImages');
const bookingRoutes = require('./routes/bookings');
const userSettingsRoutes = require('./routes/userSettings');
const newsRoutes = require('./routes/news');

dotenv.config();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', process.env.Frontend_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(securityMiddleware);
app.use(loggingMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/service-images', serviceImagesRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/news', newsRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
