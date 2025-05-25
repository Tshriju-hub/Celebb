const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: ['http://localhost:3000', process.env.Frontend_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// app.use(cookieParser());

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId] || null;
};

// Simplified middleware to authenticate socket connections
io.use((socket, next) => {
  try {
    const userId = socket.handshake.query.userId;
    const token = socket.handshake.auth.token;

    if (!userId) {
      console.log('Socket connection attempt without userId');
      return next(new Error('Missing userId'));
    }

    socket.userId = userId;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Socket middleware error:', error);
    next(error);
  }
});

io.on("connection", (socket) => {
  console.log('New socket connection:', socket.id);
  const userId = socket.userId;
  
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  }

  io.emit("getOnlineUsers", userSocketMap);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      io.emit("getOnlineUsers", userSocketMap);
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("joinVenueRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined venue room ${roomId}`);
  });

  socket.on("venueMessage", (data) => {
    const { roomId, ...message } = data;
    io.to(roomId).emit("venueMessage", message);
  });
});

io.on("error", (error) => {
  console.error("Socket.IO server error:", error);
});

module.exports = {
  app,
  io,
  server,
  getReceiverSocketId
};
