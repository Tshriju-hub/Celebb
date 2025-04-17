const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a venue name']
  },
  description: {
    type: String,
    required: [true, 'Please provide a venue description']
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify the venue capacity']
  },
  price: {
    type: Number,
    required: [true, 'Please specify the venue price']
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venue', venueSchema); 