const express = require("express");
const { 
  createBooking, 
  getBookings,
  getOwnerBookings,
  updateBookingStatus,
  sendMessage,
  getBookedDates
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");
const router = express.Router();

// POST /api/bookings - Create new booking
router.post("/", protect, createBooking);

// POST /api/bookings/message - Send message
router.post("/message", protect, sendMessage);

router.post("/getbookeddates",getBookedDates);

// GET /api/bookings - Get all bookings
router.get("/", protect, getBookings);

// GET /api/bookings/owner/:ownerId - Get bookings by owner
router.get("/owner/:ownerId", protect, getOwnerBookings);

// PATCH /api/bookings/:bookingId/status - Update booking status
router.patch("/:bookingId/status", protect, updateBookingStatus);

module.exports = router;
