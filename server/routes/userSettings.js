const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  updateProfile,
  updatePassword,
  updateNotificationSettings,
  updatePrivacySettings,
} = require("../controllers/userSettingsController");

// All routes are protected and require authentication
router.use(protect);

// Profile routes
router.put("/profile", updateProfile);
router.put("/password", updatePassword);

// Settings routes
router.put("/notifications", updateNotificationSettings);
router.put("/privacy", updatePrivacySettings);

module.exports = router; 