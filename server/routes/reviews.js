const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Get reviews for a venue
router.get('/:id', reviewController.getReviews);

// Add a review
router.post('/:id', auth, reviewController.addReview);

// Like a review
router.post('/:id/like', auth, reviewController.likeReview);

// Add reply to a review
router.post('/:id/reply', auth, reviewController.addReply);

module.exports = router;
