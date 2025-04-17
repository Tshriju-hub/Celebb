const User = require('../models/User');
const LoyaltyHistory = require('../models/LoyaltyHistory');
const asyncHandler = require('express-async-handler');

// Constants for loyalty points
const DAILY_POINTS = 50; // Points earned for daily login
const POINTS_PER_BOOKING = 100; // Points earned per booking
const MIN_POINTS_REDEEM = 100; // Minimum points needed to redeem
const POINTS_TO_CURRENCY = 0.1; // Each point is worth $0.10

// @desc    Claim daily points
// @route   POST /api/loyalty/claim-daily
// @access  Private
const claimDailyPoints = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has already claimed points today
  const lastClaimed = user.lastPointsClaimed;
  const now = new Date();
  
  if (lastClaimed) {
    const lastClaimedDate = new Date(lastClaimed);
    const isSameDay = lastClaimedDate.toDateString() === now.toDateString();
    
    if (isSameDay) {
      res.status(400);
      throw new Error('You have already claimed your daily points today');
    }
  }

  // Award points and update last claimed date
  user.loyaltyPoints += DAILY_POINTS;
  user.lastPointsClaimed = now;
  await user.save();

  // Record in history
  await LoyaltyHistory.create({
    userId: user._id,
    points: DAILY_POINTS,
    action: 'daily_claim',
    description: 'Daily loyalty points claimed'
  });

  res.status(200).json({
    success: true,
    message: `Successfully claimed ${DAILY_POINTS} daily points`,
    currentPoints: user.loyaltyPoints
  });
});

// @desc    Get user's loyalty points
// @route   GET /api/loyalty/points
// @access  Private
const getLoyaltyPoints = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const canClaimDaily = !user.lastPointsClaimed || 
    new Date(user.lastPointsClaimed).toDateString() !== new Date().toDateString();

  res.status(200).json({
    points: user.loyaltyPoints,
    canClaimDaily,
    lastClaimed: user.lastPointsClaimed,
    pointsWorth: user.loyaltyPoints * POINTS_TO_CURRENCY
  });
});

// @desc    Get user's loyalty history
// @route   GET /api/loyalty/history
// @access  Private
const getLoyaltyHistory = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const history = await LoyaltyHistory.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    history
  });
});

// @desc    Redeem points for a discount
// @route   POST /api/loyalty/redeem
// @access  Private
const redeemPoints = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const { pointsToRedeem } = req.body;

  if (!pointsToRedeem || pointsToRedeem < MIN_POINTS_REDEEM) {
    res.status(400);
    throw new Error(`Minimum ${MIN_POINTS_REDEEM} points required to redeem`);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.loyaltyPoints < pointsToRedeem) {
    res.status(400);
    throw new Error('Insufficient points');
  }

  // Calculate discount amount
  const discountAmount = pointsToRedeem * POINTS_TO_CURRENCY;

  // Deduct points
  user.loyaltyPoints -= pointsToRedeem;
  await user.save();

  // Record in history
  await LoyaltyHistory.create({
    userId: user._id,
    points: -pointsToRedeem,
    action: 'redeemed',
    description: `Redeemed ${pointsToRedeem} points for a discount of $${discountAmount.toFixed(2)}`
  });

  res.status(200).json({
    success: true,
    message: `Successfully redeemed ${pointsToRedeem} points`,
    discountAmount,
    remainingPoints: user.loyaltyPoints
  });
});

module.exports = {
  claimDailyPoints,
  getLoyaltyPoints,
  getLoyaltyHistory,
  redeemPoints
}; 