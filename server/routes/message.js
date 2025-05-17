const express = require("express");
const { getMessages, sendMessage, deleteConversation, getUsersForSidebar, getLastMessage, getOwnerConversations } = require("../controllers/messageController");
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/getusersforsidebar', protect, getUsersForSidebar);
router.get('/getlastmessage', protect, getLastMessage);
router.get('/getownerconversations', protect, getOwnerConversations);
router.post('/deleteconversation/:id', protect, deleteConversation);
router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);

module.exports = router;