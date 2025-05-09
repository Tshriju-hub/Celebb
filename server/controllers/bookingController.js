const Booking = require("../models/Booking");
const qrcode = require("qrcode-terminal");
const pkg = require("whatsapp-web.js");
const customAuth = require("../lib/customAuth.js");
const { Client } = pkg;
const User = require("../models/User");
const LoyaltyHistory = require("../models/LoyaltyHistory");
const mongoose = require("mongoose");
const { createNotification } = require('./notificationController');
const Registration = require("../models/Registration");

const client = new Client({
  authStrategy: new customAuth(),
});

// WhatsApp QR code and ready events
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.initialize();

// Send WhatsApp message
const sendMessage = async (phoneNumber, message) => {
  try {
    // Remove any non-digit characters from the phone number
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // If the number starts with '977', remove it
    if (formattedNumber.startsWith('977')) {
      formattedNumber = formattedNumber.substring(3);
    }
    
    // Add the country code if not present
    if (!formattedNumber.startsWith('977')) {
      formattedNumber = '977' + formattedNumber;
    }
    
    // Create the WhatsApp ID format
    const chatId = `${formattedNumber}@c.us`;
    
    console.log('Server: Attempting to send WhatsApp message to:', chatId);
    await client.sendMessage(chatId, message);
    console.log('Server: WhatsApp message sent successfully to:', chatId);
    return true;
  } catch (error) {
    console.error(`Server: Failed to send WhatsApp message to ${phoneNumber}:`, error.message);
    return false;
  }
};

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      owner, // This could be either Google ID or MongoDB ObjectId
      eventType,
      eventTime,
      totalGuests,
      date,
      hall,
      catering,
      menu,
      menuInstructions,
      fullName,
      email,
      phone1,
      phone2,
      address,
      pointsToRedeem,
      venueId,
      whatsappNotifications
    } = req.body;

    console.log('Server: Creating booking with owner ID:', owner);
    console.log('Server: Owner ID type:', typeof owner);

    // Basic validation
    if (!eventType || !eventTime || !totalGuests || !date || !fullName || !email || !phone1) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone1) || (phone2 && !phoneRegex.test(phone2))) {
      return res.status(400).json({ message: "Phone numbers must be 10 digits" });
    }

    // Total guests validation
    if (totalGuests < 1) {
      return res.status(400).json({ message: "Total guests must be at least 1" });
    }

    // Find user by either Google ID or MongoDB ObjectId
    let user;
    if (mongoose.Types.ObjectId.isValid(owner)) {
      user = await User.findById(owner);
    } else {
      user = await User.findOne({ googleId: owner });
    }

    if (!user) {
      console.log('Server: User not found with ID:', owner);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Server: Found user:', user._id);

    // Handle loyalty points redemption
    let discountAmount = 0;
    if (pointsToRedeem) {
      // Validate points redemption
      if (pointsToRedeem < 100) {
        return res.status(400).json({ message: "Minimum 100 points required to redeem" });
      }

      if (user.loyaltyPoints < pointsToRedeem) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }

      // Calculate discount (1 point = 1 rupee)
      discountAmount = pointsToRedeem;

      // Deduct points from user
      user.loyaltyPoints -= pointsToRedeem;
      await user.save();

      // Record in loyalty history
      await LoyaltyHistory.create({
        userId: user._id,
        points: -pointsToRedeem,
        action: 'redeemed',
        description: `Redeemed ${pointsToRedeem} points for a discount of Rs${discountAmount} on booking`
      });
    }

    // Create new booking document
    const newBooking = new Booking({
      owner: user._id, // Use the MongoDB _id from the found user
      venueId: venueId, // Add the venueId to the booking
      status: 'pending',
      eventType,
      eventTime,
      totalGuests,
      date,
      hall: hall || [],
      catering: catering || [],
      menu: menu || {
        starters: { veg: { items: [] }, nonVeg: { chicken: [], fish: [] } },
        mainCourse: {
          rice: { items: [] },
          rotiNaanNoodlesPasta: { items: [] },
          veg: { items: [] },
          vegetables: { items: [] },
          nonVeg: { mutton: [], chicken: [], fish: [] }
        },
        pickle: { veg: { items: [] }, fermented: { items: [] } },
        salads: { veg: { items: [] } },
        dessert: {
          sweets: { flourBased: [], milkBased: [] },
          dairy: { items: [] },
          ice: { items: [] }
        },
        beverages: {
          coldDrinks: { items: [] },
          teaCoffee: { items: [] },
          alcoholicDrinks: { beers: [], whiskey: [] }
        }
      },
      menuInstructions: menuInstructions || "",
      fullName,
      email,
      phone1,
      phone2: phone2 || "",
      address: address || "",
      loyaltyPointsRedeemed: pointsToRedeem || 0,
      discountAmount: discountAmount,
      whatsappNotifications: whatsappNotifications || false
    });

    // Save booking to DB
    await newBooking.save();
    console.log('Server: Booking created with ID:', newBooking._id);
    console.log('Server: Booking owner ID:', newBooking.owner);

    // Find the venue owner using the venueId from the request
    const venue = await Registration.findById(venueId);
    if (!venue) {
      console.error('Server: Venue not found for venueId:', venueId);
    }

    // Find the venue owner using the venue's owner field
    const venueOwner = await User.findById(venue?.owner);
    if (!venueOwner) {
      console.error('Server: Venue owner not found for venue:', venueId);
    }

    // Create notification for the venue owner
    if (venueOwner) {
      console.log('Server: Creating notification for venue owner:', venueOwner._id);
      await createNotification(
        venueOwner._id,
        'booking',
        'New Booking Received',
        `A new booking has been received for ${eventType} on ${date}`,
        `/owner/bookings/${newBooking._id}`
      );
    }

    // Create notification for the booking user (the person making the booking)
    if (req.user && req.user._id) {
      await createNotification(
        req.user._id,
        'booking',
        'Booking Submitted',
        `Your booking request for ${eventType} has been submitted successfully. We will notify you once it's reviewed.`,
        `/bookings/${newBooking._id}`
      );
    } else {
      console.error('Server: User not authenticated for notification');
    }

    // Always send WhatsApp notification to admin
    try {
      await sendMessage("9860462875", `Alert: A new booking has been received from ${fullName} for ${eventType} on ${date}. Total guests: ${totalGuests}. Please check the owner dashboard.`);
    } catch (whatsappError) {
      console.error('Server: Error sending WhatsApp notification to admin:', whatsappError);
    }

    // Send WhatsApp notification to customer only if they opted in
    if (whatsappNotifications) {
      try {
        await sendMessage(phone1, `Hello ${fullName}, your booking request has been submitted! We'll review it and get back to you soon. Thank you for choosing us.`);
      } catch (whatsappError) {
        console.error('Server: Error sending WhatsApp notification to customer:', whatsappError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
      discountApplied: discountAmount > 0 ? discountAmount : 0
    });
  } catch (error) {
    console.error("Server: Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message
    });
  }
};

// Get all bookings
const getBookings = async (req, res) => {
  try {
    // Get the authenticated user
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    console.log('Fetching bookings for user:', user._id);

    // Find the venue owned by this user
    const venue = await Registration.findOne({ owner: user._id });
    if (!venue) {
      console.log('No venue found for user:', user._id);
      return res.status(404).json({ 
        success: false, 
        message: "No venue found for this owner" 
      });
    }

    console.log('Found venue:', venue._id);

    // Find all bookings where the venueId matches the venue's ID
    const bookings = await Booking.find({ venueId: venue._id })
      .sort({ createdAt: -1 })
      .populate('owner', 'name email'); // Populate owner details
    
    console.log('Found bookings for venue:', bookings.length);
    
    res.status(200).json({ 
      success: true, 
      bookings,
      venueDetails: {
        name: venue.name,
        id: venue._id
      }
    });
  } catch (error) {
    console.error('Server: Error fetching bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get bookings by owner
const getOwnerBookings = async (req, res) => {
  try {
    const { ownerId } = req.params;
    console.log('Server: Fetching bookings for owner ID:', ownerId);
    
    // First, let's check if there are any bookings at all
    const allBookings = await Booking.find({});
    console.log('Server: Total bookings in database:', allBookings.length);
    
    // Now let's check bookings for this specific owner
    const bookings = await Booking.find({ owner: ownerId }).sort({ createdAt: -1 });
    console.log('Server: Found bookings for this owner:', bookings.length);
    
    // Let's log the first booking to see its structure
    if (bookings.length > 0) {
      console.log('Server: First booking owner ID:', bookings[0].owner);
      console.log('Server: First booking status:', bookings[0].status);
    }
    
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Server: Error fetching owner bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Find the booking user
    const bookingUser = await User.findById(booking.owner);
    if (!bookingUser) {
      console.error('Server: Booking user not found');
    }

    // Create notification for the booking user
    if (bookingUser) {
      await createNotification(
        bookingUser._id,
        'booking',
        `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your booking for ${booking.eventType} has been ${status}`,
        `/bookings/${booking._id}`
      );
    }

    // Always send WhatsApp notification to admin for status changes
    try {
      const statusMessage = status === 'approved' 
        ? `Booking for ${booking.eventType} by ${booking.fullName} has been approved.`
        : `Booking for ${booking.eventType} by ${booking.fullName} has been declined.`;
        
      await sendMessage("9860462875", `Status Update: ${statusMessage}`);
    } catch (whatsappError) {
      console.error('Server: Error sending status update WhatsApp notification to admin:', whatsappError);
    }

    // Send WhatsApp notification to customer only if they opted in
    if (booking.whatsappNotifications) {
      try {
        if (status === 'approved') {
          await sendMessage(
            booking.phone1,
            `Hello ${booking.fullName}, your booking for ${booking.eventType} has been approved! We look forward to hosting your event. Thank you for choosing us.`
          );
        } else if (status === 'declined') {
          await sendMessage(
            booking.phone1,
            `Hello ${booking.fullName}, we regret to inform you that your booking for ${booking.eventType} could not be accommodated at this time. Please contact us for alternative arrangements.`
          );
        }
      } catch (whatsappError) {
        console.error('Server: Error sending status update WhatsApp notification to customer:', whatsappError);
      }
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error('Server: Error updating booking status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getOwnerBookings,
  updateBookingStatus,
  sendMessage
};
