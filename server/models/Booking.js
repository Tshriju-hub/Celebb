const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    service: {
      type: String,
      required: [true, 'Please specify the service']
    },
    date: {
      type: Date,
      required: [true, 'Please specify the booking date']
    },
    time: {
      type: String,
      required: [true, 'Please specify the booking time']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    advancePayment: {
      type: Number,
      required: [true, 'Please specify the advance payment amount']
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    pointsRedeemed: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

module.exports = Booking;
