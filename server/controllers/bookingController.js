const Booking = require("../models/Booking");
const User = require('../models/User');
const LoyaltyHistory = require('../models/LoyaltyHistory');
const asyncHandler = require('express-async-handler');

// Points configuration
const POINTS_PER_BOOKING = 100; // Points earned per booking
const POINTS_REDEMPTION_RATE = 1; // Each point is worth Rs. 1
const MIN_POINTS_REDEEM = 100; // Minimum points needed to redeem

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { service, date, time, advancePayment, pointsToRedeem } = req.body;

  // Get user's current points
  const user = await User.findById(req.user._id);
  
  // Calculate discount if points are being redeemed
  let discountAmount = 0;
  if (pointsToRedeem && pointsToRedeem >= MIN_POINTS_REDEEM) {
    if (pointsToRedeem > user.loyaltyPoints) {
      res.status(400);
      throw new Error('Insufficient points for redemption');
    }
    
    // Calculate discount (each point is worth Rs. 1)
    discountAmount = pointsToRedeem * POINTS_REDEMPTION_RATE;
    
    // Update user's points
    user.loyaltyPoints -= pointsToRedeem;
    await user.save();
    
    // Record points redemption in history
    await LoyaltyHistory.create({
      userId: req.user._id,
      points: -pointsToRedeem,
      description: `Points redeemed for booking discount (Rs. ${discountAmount})`
    });
  }

  // Calculate final advance payment after discount
  const finalAdvancePayment = advancePayment - discountAmount;

  // Create the booking
  const booking = await Booking.create({
    user: req.user._id,
    service,
    date,
    time,
    advancePayment: finalAdvancePayment,
    pointsEarned: POINTS_PER_BOOKING,
    pointsRedeemed: pointsToRedeem || 0,
    discountAmount
  });

  // Update user's loyalty points for the booking
  user.loyaltyPoints += POINTS_PER_BOOKING;
  await user.save();

  // Record points earned in history
  await LoyaltyHistory.create({
    userId: req.user._id,
    points: POINTS_PER_BOOKING,
    description: `Points earned from booking ${service}`
  });

  res.status(201).json({
    ...booking.toJSON(),
    originalAdvancePayment: advancePayment,
    discountAmount,
    finalAdvancePayment
  });
});

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });
  res.json(bookings);
});

// @desc    Get a specific booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the booking belongs to the user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(booking);
});

// @desc    Update a booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the booking belongs to the user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedBooking);
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if the booking belongs to the user
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await booking.remove();
  res.json({ message: 'Booking removed' });
});

// Get bookings by owner
const getOwnerBookings = asyncHandler(async (req, res) => {
    const { ownerId } = req.params;
  console.log("Owner ID:", ownerId);
    const bookings = await Booking.find({ owner: ownerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
});

// Update booking status
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, booking });
});

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getOwnerBookings,
  updateBookingStatus
};
