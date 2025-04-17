const express = require('express');
const {
  createNews,
  getNews,
  updateNews,
  deleteNews
} = require('../controllers/newsController');

const router = express.Router();

router.route('/')
  .post(createNews)
  .get(getNews);

router.route('/:id')
  .put(updateNews)
  .delete(deleteNews);

module.exports = router;
