const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  uploadServiceImage,
  getServiceImages,
  deleteServiceImage
} = require('../controllers/serviceImageController');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('Service Images Route:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    file: req.file
  });
  next();
});

// Get service images by category
router.get('/', protect, getServiceImages);

// Upload new service image
router.post('/', protect, upload.single('image'), uploadServiceImage);

// Delete service image
router.delete('/:id', protect, deleteServiceImage);

module.exports = router; 