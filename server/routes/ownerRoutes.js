const express = require('express');
const router = express.Router();
const { registerOwner, getVenues, getVenueDetails, getVenuesforOwner, approveVenue, getVenueAdmin, deleteVenue, banVenue, getPdfDocument } = require('../controllers/ownerController');
const upload = require('../middleware/multer');

// ... existing routes ...

// Add the new PDF proxy route
router.get('/pdf', getPdfDocument);

module.exports = router; 