const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  claimDailyPoints,
  getLoyaltyPoints,
  getLoyaltyHistory,
  redeemPoints
} = require('../controllers/loyaltyController');

// All routes are protected
router.use(protect);

// Claim daily points
router.post('/claim-daily', claimDailyPoints);

// Get loyalty points info
router.get('/points', getLoyaltyPoints);

// Get loyalty history
router.get('/history', getLoyaltyHistory);

// Redeem points
router.post('/redeem', redeemPoints);

module.exports = router; 