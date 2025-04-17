const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name']
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description']
  },
  price: {
    type: Number,
    required: [true, 'Please specify the service price']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please specify the service duration']
  },
  category: {
    type: String,
    required: [true, 'Please specify the service category'],
    enum: ['photography', 'videography', 'catering', 'decoration', 'entertainment', 'other']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  availability: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema); 