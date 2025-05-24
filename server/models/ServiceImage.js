const mongoose = require('mongoose');

const serviceImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['makeup', 'decor', 'entertainment']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const ServiceImage = mongoose.models.ServiceImage || mongoose.model('ServiceImage', serviceImageSchema);

module.exports = ServiceImage; 
