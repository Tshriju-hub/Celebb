const News = require('../models/News');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { createNotification } = require('./notificationController');
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

// Create new news
const createNews = async (req, res) => {
  try {
    const { title, description } = req.body;
    let imageUrl = '';

    // Upload image if provided
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const news = new News({
      title,
      description,
      image: imageUrl,
      owner: req.user.id
    });
    await news.save();

    // Get all users to notify
    const users = await User.find({});
    
    // Create notifications for all users
    const notificationPromises = users.map(user => 
      createNotification(
        user._id,
        'news',
        'New Announcement',
        title,
        `/news/${news._id}`
      )
    );

    await Promise.all(notificationPromises);

    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all news
const getNews = async (req, res) => {
  try {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find news from last 7 days and populate owner details
    const news = await News.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate({
      path: 'owner',
      select: '_id',
      model: 'User'
    })
    .sort({ createdAt: -1 });

    // Get venue names for each news item
    const newsWithVenues = await Promise.all(news.map(async (item) => {
      const venue = await Registration.findOne({ owner: item.owner });
      const newsObj = item.toObject();
      newsObj.venueName = venue ? venue.name : 'Unknown Venue';
      return newsObj;
    }));

    res.json(newsWithVenues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single news
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const { title, description } = req.body;
    let update = { title, description };

    // Upload new image if provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      update.image = imageUrl;
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete news
const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNews,
  getNews,
  getNewsById,
  updateNews,
  deleteNews
};

