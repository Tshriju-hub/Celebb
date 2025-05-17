const { getReceiverSocketId, io } = require("../socket/socket.js");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { timeAgoMessage } = require("../lib/timeago.js");

const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id; // Get the current user's ID

    const users = await User.find({
      _id: { $ne: userId },
      role: 'owner',
    })
      .select('-password')
      .sort({ updatedAt: -1 });

      console.log(users);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsersForSidebar:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOwnerConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find conversations where the user is a participant
        const conversations = await Conversation.find({
            participants: userId,
        });

        // Extract all other participants
        const otherUserIds = new Set();

        conversations.forEach(convo => {
            convo.participants.forEach(participantId => {
                if (participantId.toString() !== userId.toString()) {
                    otherUserIds.add(participantId.toString());
                }
            });
        });

        // Optionally, fetch user details from the User model
        const users = await User.find({ _id: { $in: Array.from(otherUserIds) } }).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error in getOwnerConversations:', error.message);
        res.status(500).json({ error: 'Internal server error' });   
    }
};


const getLastMessage = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "messages",       // Populate the messages field
        model: "Message",       // Reference the 'Message' model
        options: { sort: { createdAt: -1 }, limit: 1 }, // Get the most recent message
      })
      .populate({
        path: "participants",   // Populate the participants field
        model: "User",          // Reference the 'User' model
        select: "-password",    // Exclude password from the populated participants
      });

    if (!conversations.length) {
      return res.status(200).json([]);
    }

    // Process each conversation to include the last message and participants
    const conv = conversations.map((conversation) => {
      // Get the last message (latest message)
      const lastMessage = conversation.messages.length > 0 ? conversation.messages[0] : null;

      // Return the conversation data with full populated participants and last message
      return {
        _id: conversation._id,
        participants: conversation.participants,  // Full participant objects populated
        lastMessage: lastMessage ? lastMessage : null,  // Full message object populated
        timeAgo: lastMessage ? timeAgoMessage(lastMessage.createdAt) : '',  // Format time ago for the last message
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    });

    console.log("Conversations with last message:", conv);
    // Return the conversations with the last message and participants
    res.status(200).json(conv);
  } catch (error) {
    console.error("Error in getLastMessage:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};



const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);

    // SOCKET IO FUNCTIONALITY WILL GO HERE
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // io.to(<socket_id>).emit() used to send events to specific client
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES
    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOneAndDelete({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.log("Error in deleteConversation controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sendMessage, getMessages, deleteConversation, getUsersForSidebar, getLastMessage , getOwnerConversations};
