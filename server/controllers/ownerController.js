const Registration = require('../models/Registration');
const cloudinary = require('../lib/cloudinary');
const stream = require('stream');

// Helper to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    bufferStream.pipe(uploadStream);
  });
};

const registerOwner = async (req, res) => {
  try {
    const {
      ownerName,
      ownerEmail,
      ownerPhone,
      name,
      address,
      phone,
      established,
      advancePayment,
      spacePreference,
      capacity,
      numberOfHalls,
      foodSilverPrice,
      foodGoldPrice,
      foodDiamondPrice,
      makeupPrice,
      decorationPrice,
      entertainmentPrice,
      owner,
      status
    } = req.body;

    // Check if email already exists
    const existingEmail = await Registration.findOne({ ownerEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        field: 'ownerEmail'
      });
    }

    // Files
    const hallImagesFiles = req.files?.hallImages || [];
    const companyDocs = req.files?.companyRegistration || [];
    const citizenshipDocs = req.files?.ownerCitizenship || [];

    // Upload files to Cloudinary and store the URLs
    const hallImages = await Promise.all(
      hallImagesFiles.map((file) => uploadToCloudinary(file.buffer))
    );
    const companyRegistration = await Promise.all(
      companyDocs.map((file) => uploadToCloudinary(file.buffer))
    );
    const ownerCitizenship = await Promise.all(
      citizenshipDocs.map((file) => uploadToCloudinary(file.buffer))
    );

    const registration = new Registration({
      ownerName,
      ownerEmail,
      ownerPhone,
      name,
      address,
      phone,
      established,
      advancePayment,
      spacePreference,
      capacity,
      numberOfHalls,
      hallImages,
      foodSilverPrice,
      foodGoldPrice,
      foodDiamondPrice,
      makeupPrice,
      decorationPrice,
      entertainmentPrice,
      companyRegistration,
      ownerCitizenship,
      owner,
      status
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Owner registration submitted successfully!',
      registrationId: registration._id
    });
  } catch (error) {
    console.error('Owner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Owner registration failed',
      error: error.message
    });
  }
};

const getVenueAdmin  = async (req, res) => {
  console.log('Fetching all registrations...'); // Log the action for debugging
  try {
    const registrations = await Registration.find(); // Fetch only approved registrations
    res.status(200).json(registrations); // Return the approved registrations as a JSON response
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
}


const getVenues = async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'approved' }); // Fetch only approved registrations
    res.status(200).json(registrations); // Return the approved registrations as a JSON response
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
};

const getVenuesforOwner = async (req, res) => {
  const {ownerId} = req.body; // Get the ownerId from the request body
  console.log('Owner ID:', ownerId); // Log the ownerId for debugging
  try {
    const registrations = await Registration.find(); // Fetch all registrations
    const filteredRegistrations = registrations.filter
      (registration => registration.owner.toString() === ownerId); // Filter registrations by ownerId
    
    if (filteredRegistrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No registrations found for this owner' });
    }
    
    res.status(200).json(filteredRegistrations); // Return the filtered registrations as a JSON response
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
  }
};

const getVenueDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters
    const venue = await Registration.findById(id); // Fetch the venue from the database

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    res.status(200).json(venue);
  } catch (error) {
    console.error('Error fetching venue details:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const approveVenue = async (req, res) => {
  try {
    const { id } = req.body; // Get the ID from the request parameters
    console.log('ID:', id); // Log the ID for debugging
    const venue = await Registration.findById(id); // Fetch the venue from the database
    console.log('Venue:', venue); // Log the venue for debugging
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    venue.status = 'approved'; // Update the status to approved
    await venue.save(); // Save the changes to the database

    res.status(200).json({ success: true, message: 'Venue approved successfully' });
  } catch (error) {
    console.error('Error approving venue:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = { registerOwner, getVenues ,getVenueDetails, getVenuesforOwner, approveVenue,getVenueAdmin };
