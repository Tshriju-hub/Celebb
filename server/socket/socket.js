const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

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

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  }

  io.emit("getOnlineUsers", userSocketMap);
  console.log("Online users:", userSocketMap);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];
      console.log(`User ${disconnectedUserId} disconnected`);
      io.emit("getOnlineUsers", userSocketMap);
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
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
