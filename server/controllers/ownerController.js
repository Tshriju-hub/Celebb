const Registration = require('../models/Registration');
const cloudinary = require('../lib/cloudinary');
const stream = require('stream');
const fetch = require('node-fetch');

// Helper to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, isDocument = false) => {
  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const uploadOptions = {
      resource_type: isDocument ? 'raw' : 'auto',
      format: isDocument ? 'pdf' : undefined,
      folder: isDocument ? 'documents' : 'images',
      access_mode: 'public',
      type: 'upload'
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    bufferStream.pipe(uploadStream);
  });
};

const registerOwner = async (req, res) => {
  console.log('Received registration data:', req.body); // Log the received data for debugging
  console.log('Received files:', req.files); // Log the received files for debugging
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
      description,
      category,
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
    const qrcode = req.files?.qrCode || [];

    // Upload files to Cloudinary and store the URLs
    const hallImages = await Promise.all(
      hallImagesFiles.map((file) => uploadToCloudinary(file.buffer))
    );
    const companyRegistration = await Promise.all(
      companyDocs.map((file) => uploadToCloudinary(file.buffer, true))
    );
    const ownerCitizenship = await Promise.all(
      citizenshipDocs.map((file) => uploadToCloudinary(file.buffer, true))
    );

    const qrcodeUrl = await uploadToCloudinary(qrcode[0].buffer);
    console.log('QR Code URL:', qrcodeUrl); // Log the QR code URL for debugging


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
      description,
      category,
      qrCode: qrcodeUrl,
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
    const registrations = await Registration.find({ owner: ownerId }); // Fetch registrations for this owner
    
    if (registrations.length === 0) {
      return res.status(404).json({ success: false, message: 'No registrations found for this owner' });
    }
    
    console.log('Found registrations:', registrations); // Log the found registrations
    res.status(200).json(registrations); // Return the registrations as a JSON response
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

const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters
    const venue = await Registration.findById(id); // Fetch the venue from the database

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    await Registration.deleteOne({ _id: id }); // Delete the venue from the database

    res.status(200).json({ success: true, message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

const banVenue = async (req, res) => {
  try {
    const { id } = req.body; // Get the ID from the request parameters
    const venue = await Registration.findById(id); // Fetch the venue from the database

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    venue.status = 'banned'; // Update the status to banned
    await venue.save(); // Save the changes to the database

    res.status(200).json({ success: true, message: 'Venue banned successfully' });
  } catch (error) {
    console.error('Error banning venue:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPdfDocument = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // Fetch the PDF from Cloudinary
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }

    // Get the PDF content
    const pdfBuffer = await response.buffer();

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch PDF' });
  }
};

module.exports = { registerOwner, getVenues ,getVenueDetails, getVenuesforOwner, approveVenue,getVenueAdmin, deleteVenue, banVenue, getPdfDocument };
