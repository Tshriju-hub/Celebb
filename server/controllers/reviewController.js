const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");

// Get all reviews for a venue
const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ venueId: id })
      .sort({ createdAt: -1 })
      .populate("userId", "username");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new review
const addReview = async (req, res) => {
  try {
    const venueId = req.params.id || req.body.venueId;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    console.log('Received review data:', { venueId, userId, rating, comment });

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle both MongoDB ObjectId and Google ID strings
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      // For Google-authenticated users
      user = await User.findOne({ googleId: userId });
    }
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const newReview = new Review({
      venueId: venueId,
      userId: user._id,
      username: user.username || user.name || user.email.split('@')[0],
      rating: Number(rating),
      comment
    });

    console.log('Creating new review:', newReview);
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ 
      message: 'Failed to add review',
      error: error.message,
      stack: error.stack 
    });
  }
};

// Like a review
const likeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.likes.includes(userId)) {
      return res.status(400).json({ message: "You already liked this review" });
    }

    review.likes.push(userId);
    await review.save();
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add reply to a review
const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId, reply } = req.body;
    const userId = req.user.id;

    if (!reviewId || !reply) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify user exists
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ googleId: userId });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newReply = {
      userId: user._id,
      username: user.username || user.name || user.email.split('@')[0],
      reply: reply,
      createdAt: new Date()
    };

    review.replies.push(newReply);
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      message: 'Failed to add reply',
      error: error.message 
    });
  }
};

module.exports = {
  getReviews,
  addReview,
  likeReview,
  addReply
};
