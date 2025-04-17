const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/getallusers', userController.getAllUsers);

router.get('/profile', userController.getProfile);

// Get user details
router.get('/details', userController.getUserDetails);


// Update user profile
router.put('/profile', userController.updateProfile);

// Delete user account
router.delete('/profile', userController.deleteAccount);

module.exports = router;
