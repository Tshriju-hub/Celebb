const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');

// All routes are protected and require authentication
router.use(protect);

// Create a new booking
router.post('/', createBooking);

// Get all bookings for the logged-in user
router.get('/', getBookings);

// Get a specific booking by ID
router.get('/:id', getBookingById);

// Update a booking
router.put('/:id', updateBooking);

// Delete a booking
router.delete('/:id', deleteBooking);

module.exports = router; 