const News = require('../models/News');

// Create new news
const createNews = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const news = new News({
      title,
      description,
      image,
    });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all news
const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update news
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete news
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    await News.findByIdAndDelete(id);
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNews,
  getNews, 
  updateNews,
  deleteNews
};
