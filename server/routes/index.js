const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./users');
const venueRoutes = require('./venues');
const bookingRoutes = require('./bookings');
const newsRoutes = require('./news');
const notificationRoutes = require('./notifications');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/venues', venueRoutes);
router.use('/bookings', bookingRoutes);
router.use('/news', newsRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router; 