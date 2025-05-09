const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    owner:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    },
    eventType: {
      type: String,
      required: false,
    },
    eventTime: {
      type: String,
      required: false,
    },
    totalGuests: {
      type: Number,
      required: false,
      min: 1, // Minimum number of guests
    },
    date: {
      type: Date,
      required: false,
    },
    hall: {
      type: [String],
      default: [],
      required: false,
    },
    catering: {
      type: [String],
      default: [],
      required: false,
    },

    menu: {
      starters: {
        veg: {
          items: { type: [String], default: [] },
        },
        nonVeg: {
          chicken: { type: [String], default: [] },
          fish: { type: [String], default: [] },
        },
      },
      mainCourse: {
        rice: {
          items: { type: [String], default: [] },
        },
        rotiNaanNoodlesPasta: {
          items: { type: [String], default: [] },
        },
        veg: {
          items: { type: [String], default: [] },
        },
        vegetables: {
          items: { type: [String], default: [] },
        },
        nonVeg: {
          mutton: { type: [String], default: [] },
          chicken: { type: [String], default: [] },
          fish: { type: [String], default: [] },
        },
      },
      pickle: {
        veg: {
          items: { type: [String], default: [] },
        },
        fermented: {
          items: { type: [String], default: [] },
        },
      },
      salads: {
        veg: {
          items: { type: [String], default: [] },
        },
      },
      dessert: {
        sweets: {
          flourBased: { type: [String], default: [] },
          milkBased: { type: [String], default: [] },
        },
        dairy: {
          items: { type: [String], default: [] },
        },
        ice: {
          items: { type: [String], default: [] },
        },
      },
      beverages: {
        coldDrinks: {
          items: { type: [String], default: [] },
        },

        teaCoffee: { items: { type: [String], default: [] } },

        alcoholicDrinks: {
          beers: { type: [String], default: [] },
          whiskey: { type: [String], default: [] },
        },
      },
    },

    menuInstructions: {
      type: String,
      required: false,
    },

    fullName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      match: /^\S+@\S+\.\S+$/, // Email format validation
    },
    phone1: {
      type: String,
      required: false,
      match: /^[0-9]{10}$/, // Phone number format validation
    },
    phone2: {
      type: String,
      required: false,
      match: /^[0-9]{10}$/, // Phone number format validation
    },
    address: {
      type: String,
      required: false,
    },
    loyaltyPointsRedeemed: {
      type: Number,
      default: 0,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    whatsappNotifications: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

module.exports = Booking;
