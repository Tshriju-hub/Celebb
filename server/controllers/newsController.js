const News = require('../models/News');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Create new news
const createNews = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const news = new News({
      title,
      description,
      image,
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
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
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
    const { title, description, image } = req.body;
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { title, description, image },
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
