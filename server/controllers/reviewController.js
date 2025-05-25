const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Registration = require("../models/Registration");
const { createNotification } = require('./notificationController');

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

    // Get venue owner
    const venue = await Registration.findById(venueId);
    if (venue && venue.ownerId) {
      try {
        // Create notification for venue owner
        await createNotification(
          venue.ownerId,
          'review',
          'New Review Received',
          `${user.username || user.name} has left a ${rating}-star review for your venue`,
          `/venues/${venueId}`
        );
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue with the review creation even if notification fails
      }
    }

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

    // Remove from dislikes if exists
    if (review.dislikes.includes(userId)) {
      review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
    }

    // Add to likes if not already liked
    if (!review.likes.includes(userId)) {
      review.likes.push(userId);
      
      // Get the review author
      const reviewAuthor = await User.findById(review.userId);
      if (reviewAuthor) {
        // Create notification for review author
        await createNotification(
          reviewAuthor._id,
          'review',
          'Review Liked',
          `${req.user.username || req.user.name} liked your review`,
          `/venues/${id}`
        );
      }
    }

    await review.save();
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dislike a review
const dislikeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Remove from likes if exists
    if (review.likes.includes(userId)) {
      review.likes = review.likes.filter(id => id.toString() !== userId);
    }

    // Add to dislikes if not already disliked
    if (!review.dislikes.includes(userId)) {
      review.dislikes.push(userId);
      
      // Get the review author
      const reviewAuthor = await User.findById(review.userId);
      if (reviewAuthor) {
        // Create notification for review author
        await createNotification(
          reviewAuthor._id,
          'review',
          'Review Disliked',
          `${req.user.username || req.user.name} disliked your review`,
          `/venues/${id}`
        );
      }
    }

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

    // Get the review author
    const reviewAuthor = await User.findById(review.userId);
    if (reviewAuthor) {
      // Create notification for review author
      await createNotification(
        reviewAuthor._id,
        'review',
        'New Reply to Your Review',
        `${user.username || user.name} replied to your review`,
        `/venues/${id}`
      );
    }

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
  dislikeReview,
  addReply
};
