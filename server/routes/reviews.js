const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Get reviews for a venue
router.get('/:id', reviewController.getReviews);

// Add a review
router.post('/:id', protect, reviewController.addReview);

// Like a review
router.post('/:id/like', protect, reviewController.likeReview);

// Dislike a review
router.post('/:id/dislike', protect, reviewController.dislikeReview);

// Add reply to a review
router.post('/:id/reply', protect, reviewController.addReply);

module.exports = router;
