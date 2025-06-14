const express = require("express");
const { getMessages, sendMessage, deleteConversation, getUsersForSidebar, getLastMessage, getOwnerConversations } = require("../controllers/messageController");
const { protect } = require('../middleware/auth');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Message Routes] ${req.method} ${req.path}`, {
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

router.get('/getusersforsidebar', protect, getUsersForSidebar);
router.get('/getlastmessage', protect, getLastMessage);
router.get('/getownerconversations', protect, getOwnerConversations);
router.post('/deleteconversation/:id', protect, deleteConversation);
router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);

module.exports = router;