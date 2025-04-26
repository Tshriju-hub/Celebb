const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const ownerController = require('../controllers/ownerController'); // Import the owner controller
const multer = require('multer');
const upload = require('../middleware/multer'); // Import the multer middleware

router.post('/register', authController.register); // Use multer middleware for image uploads

// router.post('/register-owner', ownerController.registerOwner); // Use the correct controller for owner registration
router.post(
    '/register-owner',
    upload.fields([
      { name: 'hallImages', maxCount: 10 },
      { name: 'companyRegistration', maxCount: 5 },
      { name: 'ownerCitizenship', maxCount: 5 },
    ]),
    ownerController.registerOwner
  );
// Login routes
router.post('/login', authController.login);
router.post('/google', authController.googleSignIn); // Google sign-in route

router.get('/registrations/:id', ownerController.getVenueDetails); // New route for fetching venue details by ID
// New route for fetching user details
router.get('/user', authController.getUserDetails); // Add this line
router.post('/approve-user', authController.approveUser); // New route for approving user

router.get('/getvenue',ownerController.getVenueAdmin); // New route for fetching venue details by admin
router.get('/registrations', ownerController.getVenues); // New route for fetching all registrations
router.post('/registrations/owner', ownerController.getVenuesforOwner); // New route for fetching registrations by owner ID
router.post('/approve-venue', ownerController.approveVenue); // New route for approving a venue

module.exports = router;
