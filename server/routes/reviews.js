const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get reviews for a venue
router.get('/:id', reviewController.getReviews);

// Add a review
router.post('/:id', reviewController.addReview);

// Like a review
router.post('/:id/like', reviewController.likeReview);

// Add reply to a review
router.post('/:id/reply', reviewController.addReply);

module.exports = router;
