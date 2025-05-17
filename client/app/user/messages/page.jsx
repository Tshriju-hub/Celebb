"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { BsSendFill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { FaVideo } from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";

import useConversation from "@/hooks/useConversation";
import useGetConversations from "@/hooks/useGetConversations";
import useGetMessages from "@/hooks/useGetMessages";
import useSendMessage from "@/hooks/useSendMessage";

const Messages = ({ openProfile, openVideoCall }) => {
  const { selectedConversation, setSelectedConversation, isTyping } = useConversation();
  const { loading, finalConversations } = useGetConversations();
  const { sendMessage } = useSendMessage();
  const { messages } = useGetMessages();

  const [authUser, setAuthUser] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  console.log("Conversations:", finalConversations);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuthUser(decoded.userId);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => e.key === "Enter" && handleSend();

  const filteredConversations = useMemo(() => {
    if (!finalConversations || finalConversations.length === 0) return [];
    return finalConversations.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [finalConversations, searchQuery]);

  const formatTimestamp = (timestamp) => {
    const msgDate = new Date(timestamp);
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
    const time = msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (msgDate.toDateString() === new Date().toDateString()) return time;
    if (msgDate >= oneWeekAgo)
      return `${msgDate.toLocaleDateString([], { weekday: "short" })}, ${time}`;
    return `${msgDate.toLocaleDateString([], { month: "numeric", day: "numeric" })}, ${time}`;
  };

  if (loading || !authUser) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-gray-600">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="w-full h-[87vh] mt-[13vh] flex px-2 gap-2">
      <Sidebar
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        onUserClick={setSelectedConversation}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />
      <ChatBox
        selectedConversation={selectedConversation}
        messages={messages}
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        authUser={authUser}
        formatTimestamp={formatTimestamp}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        openVideoCall={openVideoCall}
        open={openProfile}
        isTyping={isTyping}
      />
    </div>
  );
};

const Sidebar = ({
  conversations,
  selectedConversation,
  onUserClick,
  searchQuery,
  onSearchChange,
}) => (
  <div className="bg-blue-100 rounded-2xl p-4 w-[23%] flex flex-col">
    <div className="text-2xl font-bold mb-4">Chats</div>
    <input
      type="text"
      placeholder="Search for users"
      value={searchQuery}
      onChange={onSearchChange}
      className="mb-4 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
    <div className="flex flex-col gap-3 overflow-y-auto">
      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No conversations found</div>
      ) : (
        conversations
          .filter(Boolean)
          .map((user) => (
            <div
              key={user._id}
              onClick={() => onUserClick(user)}
              className={`flex items-center p-3 rounded-xl cursor-pointer hover:bg-blue-200 ${
                selectedConversation?._id === user._id ? "bg-blue-400 text-white" : ""
              }`}
            >
              <div
                className="w-12 h-12 rounded-full bg-center bg-cover mr-3"
                style={{
                    backgroundImage: `url(${
                    user.profileImage && user.profileImage.trim() !== ""
                        ? user.profileImage
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`
                    })`,
                }}
                />
              <div className="flex-1">
                <div className="font-semibold">{user.username}</div>
                <div className="text-sm text-gray-600">
                  {user.lastMessage ? user.lastMessage : "No messages"}
                </div>
                {user.timeAgo && (
                  <div className="text-xs text-gray-400">{user.timeAgo}</div>
                )}
              </div>
              <SlOptionsVertical />
            </div>
          ))
      )}
    </div>
  </div>
);


const ChatBox = ({
  selectedConversation,
  messages,
  authUser,
  message,
  setMessage,
  handleSend,
  handleKeyDown,
  formatTimestamp,
  isModalOpen,
  setModalOpen,
  openVideoCall,
  open,
  isTyping,
}) => {
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, selectedConversation]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-blue-100 rounded-2xl">
        <h3 className="text-gray-500 text-lg">Select a user to chat</h3>
      </div>
    );
  }

  const groupedMessages = groupMessages(messages);

  return (
    <div className="flex-1 flex flex-col bg-blue-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-cover bg-center rounded-full"
            style={{ backgroundImage: `url(${selectedConversation.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.username)}&background=0D8ABC&color=fff`})` }}
          />
          <div
            className="font-semibold cursor-pointer hover:underline"
            onClick={() => open({ id: selectedConversation._id })}
          >
            {selectedConversation.username}
          </div>
        </div>
      </div>
      <hr className="border-gray-300" />
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-4" ref={messagesRef}>
        {groupedMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          groupedMessages.map((group, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="text-center text-sm text-gray-500">
                {formatTimestamp(group[0].createdAt)}
              </div>
              {group.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${authUser === msg.senderId ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {authUser !== msg.senderId && (
                      <div
                        className="w-8 h-8 rounded-full bg-center bg-cover"
                        style={{ backgroundImage: `url(${selectedConversation.profileImage || '/default-avatar.png'})` }}
                      />
                    )}
                    <div
                      className={`rounded-2xl shadow-md px-4 py-3 ${
                        authUser === msg.senderId ? "bg-blue-200" : "bg-white"
                      }`}
                    >
                      <p className="text-sm text-gray-800">{msg.message}</p>
                      <p className="text-xs text-gray-400 text-right mt-1">
                        {formatTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {isTyping && (
        <div className="text-sm italic text-gray-600 mt-2">
          {selectedConversation.username} is typing...
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>
          <BsSendFill className="text-blue-600 text-xl hover:text-blue-800" />
        </button>
      </div>
    </div>
  );
};

const groupMessages = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const grouped = [];
  let currentGroup = [];

  for (const msg of messages) {
    const msgTime = new Date(msg.createdAt);
    if (
      currentGroup.length &&
      msg.senderId === currentGroup[0].senderId &&
      (msgTime - new Date(currentGroup.at(-1).createdAt)) / 1000 <= 60
    ) {
      currentGroup.push(msg);
    } else {
      if (currentGroup.length) grouped.push(currentGroup);
      currentGroup = [msg];
    }
  }

  if (currentGroup.length) grouped.push(currentGroup);
  return grouped;
};

export default Messages;
