const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));
// app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
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
