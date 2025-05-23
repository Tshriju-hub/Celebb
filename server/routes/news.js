const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  createNews,
  getNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const router = express.Router();

router.route('/')
  .post(protect, upload.single('image'), createNews)
  .get(getNews);

router.route('/:id')
  .put(protect, upload.single('image'), updateNews)
  .delete(protect, deleteNews);

module.exports = router;

