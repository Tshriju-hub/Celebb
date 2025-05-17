const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./database/config');
const cors = require('cors');
const {
  securityMiddleware,
  loggingMiddleware,
  errorMiddleware
} = require('./middleware/config');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/reviews');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { app, server } = require('./socket/socket');

dotenv.config();

// Connect to database
connectDB();

// Apply middleware
app.use(cors({
  origin: process.env.Frontend_URL,
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use([...securityMiddleware, ...loggingMiddleware]);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Celebration Station API!' });
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/news', require('./routes/news'));
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/messages', require('./routes/message'));

// Error handling
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
