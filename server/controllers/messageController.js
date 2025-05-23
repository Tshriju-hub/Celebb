const { getReceiverSocketId, io } = require("../socket/socket.js");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { timeAgoMessage } = require("../lib/timeago.js");
const Registration = require("../models/Registration");

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
        console.log("[getOwnerConversations] Starting with Owner ID:", userId);

        if (!userId) {
            console.error("[getOwnerConversations] No user ID provided");
            return res.status(400).json({ error: "User ID is required" });
        }

        // First verify the user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            console.error("[getOwnerConversations] User not found:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("[getOwnerConversations] User verified, finding conversations...");

        // Find conversations where the user is a participant
        const conversations = await Conversation.find({
            participants: userId,
        }).lean(); // Use lean() for better performance

        console.log("[getOwnerConversations] Raw conversations found:", conversations);

        if (!conversations || conversations.length === 0) {
            console.log("[getOwnerConversations] No conversations found for user");
            return res.status(200).json([]);
        }

        // Extract participant IDs
        const participantIds = new Set();
        conversations.forEach(convo => {
            if (convo.participants) {
                convo.participants.forEach(pid => {
                    if (pid.toString() !== userId.toString()) {
                        participantIds.add(pid.toString());
                    }
                });
            }
        });

        console.log("[getOwnerConversations] Participant IDs:", Array.from(participantIds));

        if (participantIds.size === 0) {
            console.log("[getOwnerConversations] No other participants found");
            return res.status(200).json([]);
        }

        // Fetch users and their registrations
        const users = await User.find({ 
            _id: { $in: Array.from(participantIds) } 
        }).select('-password').lean();

        console.log("[getOwnerConversations] Users found:", users.map(u => u._id));

        if (!users || users.length === 0) {
            console.log("[getOwnerConversations] No users found");
            return res.status(200).json([]);
        }

        // Get registrations for all users at once
        const registrations = await Registration.find({
            owner: { $in: users.map(u => u._id) }
        }).lean();

        console.log("[getOwnerConversations] Registrations found:", registrations.map(r => r.owner));

        // Get last messages for all conversations
        const lastMessages = await Message.find({
            _id: { 
                $in: conversations.flatMap(c => c.messages || [])
            }
        })
        .sort({ createdAt: -1 })
        .lean();

        console.log("[getOwnerConversations] Last messages found:", lastMessages.length);

        // Combine all data
        const usersWithData = users.map(user => {
            const registration = registrations.find(r => r.owner.toString() === user._id.toString());
            const conversation = conversations.find(c => 
                c.participants.some(p => p.toString() === user._id.toString())
            );
            const lastMessage = lastMessages.find(m => 
                conversation?.messages?.includes(m._id)
            );

            return {
                ...user,
                registration: registration || null,
                conversationId: conversation?._id || null,
                lastMessage: lastMessage?.message || "",
                timeAgo: lastMessage ? timeAgoMessage(lastMessage.createdAt) : ""
            };
        });

        console.log("[getOwnerConversations] Final processed data:", 
            usersWithData.map(u => ({
                id: u._id,
                username: u.username,
                hasRegistration: !!u.registration,
                hasLastMessage: !!u.lastMessage
            }))
        );

        res.status(200).json(usersWithData);
    } catch (error) {
        console.error('[getOwnerConversations] Detailed error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message,
            type: error.name
        });   
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
    console.log("[sendMessage] Sender:", senderId, "Receiver:", receiverId);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      console.log("[sendMessage] Created new conversation:", conversation._id);
    } else {
      console.log("[sendMessage] Found existing conversation:", conversation._id);
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
