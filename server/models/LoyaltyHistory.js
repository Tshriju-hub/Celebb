const mongoose = require('mongoose');

const loyaltyHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoyaltyHistory', loyaltyHistorySchema); 