const express = require("express");
const { 
  createBooking, 
  getBookings,
  getOwnerBookings,
  updateBookingStatus,
  sendMessage
} = require("../controllers/bookingController");
const router = express.Router();

// POST /api/bookings - Create new booking
router.post("/", createBooking);

// POST /api/bookings/message - Send message
router.post("/message", sendMessage);

// GET /api/bookings - Get all bookings
router.get("/", getBookings);

// GET /api/bookings/owner/:ownerId - Get bookings by owner
router.get("/owner/:ownerId", getOwnerBookings);

// PATCH /api/bookings/:bookingId/status - Update booking status
router.patch("/:bookingId/status", updateBookingStatus);

module.exports = router;
