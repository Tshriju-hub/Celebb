const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, unique: true },
    ownerPhone: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    established: { type: String, required: true },
    advancePayment: { type: Number, required: true },
    spacePreference: { type: String, required: true },
    capacity: { type: Number, required: true },
    numberOfHalls: { type: Number, required: true },
    hallImages: { type: [String], required: true },
    foodSilverPrice: { type: Number, required: true },
    foodGoldPrice: { type: Number, required: true },
    foodDiamondPrice: { type: Number, required: true },
    makeupPrice: { type: Number, required: true },
    decorationPrice: { type: Number, required: true },
    entertainmentPrice: { type: Number, required: true },
    companyRegistration: { type: [String], required: true },
    ownerCitizenship: { type: [String], required: true },
    password: { type: String, required: true, default: 'palace123' },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Registration', registrationSchema);
