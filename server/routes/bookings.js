const express = require("express");
const { 
  createBooking, 
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getOwnerBookings,
  updateBookingStatus
} = require("../controllers/bookingController");
const router = express.Router();

// POST /api/bookings - Create new booking
router.post("/", createBooking);

// GET /api/bookings - Get all bookings
router.get("/", getBookings);

// GET /api/bookings/:id - Get booking by ID
router.get("/:id", getBookingById);

// PUT /api/bookings/:id - Update booking
router.put("/:id", updateBooking);

// DELETE /api/bookings/:id - Delete booking
router.delete("/:id", deleteBooking);

// GET /api/bookings/owner/:ownerId - Get bookings by owner
router.get("/owner/:ownerId", getOwnerBookings);

// PATCH /api/bookings/:bookingId/status - Update booking status
router.patch("/:bookingId/status", updateBookingStatus);

module.exports = router;
