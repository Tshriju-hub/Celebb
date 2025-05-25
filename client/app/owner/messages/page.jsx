"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { BsSendFill } from "react-icons/bs";
import { SlOptionsVertical } from "react-icons/sl";
import { FaVideo } from "react-icons/fa";
import { RiCalendarScheduleFill } from "react-icons/ri";
import OwnerSidebar from "@/components/Sidebar/OwnerSidebar";

import useConversation from "@/hooks/useConversation";
import useGetOwnerConversations from "@/hooks/useGetOwnerConversations";
import useGetMessages from "@/hooks/useGetMessages";
import useSendMessage from "@/hooks/useSendMessage";

const Messages = ({ openProfile, openVideoCall }) => {
  const { selectedConversation, setSelectedConversation, isTyping } = useConversation();
  const { loading, finalConversations } = useGetOwnerConversations();
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
    return finalConversations.filter(
      (user) =>
        user &&
        ((user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase())))
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
    <div className="flex h-screen">
      <OwnerSidebar />
      <div className="flex-1 flex px-2 gap-2">
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
  <div className="bg-white border border-gray-100 rounded-3xl shadow-lg w-72 min-w-[260px] flex flex-col p-0 backdrop-blur-sm">
    <div className="text-2xl font-bold text-gray-800 px-8 pt-8 pb-3 tracking-tight">Chats</div>
    <div className="px-8 pb-4">
      <input
        type="text"
        placeholder="Search for users"
        value={searchQuery}
        onChange={onSearchChange}
        className="mb-2 bg-white/70 border border-gray-200 focus:ring-[#eecaca] focus:border-[#eecaca] rounded-full px-4 py-2"
      />
    </div>
    <div className="flex flex-col gap-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-10 text-gray-300">No conversations found</div>
      ) : (
        conversations
          .filter(Boolean)
          .map((user) => {
            const venueImage = user.registration && user.registration.hallImages && user.registration.hallImages.length > 0 && user.registration.hallImages[0]
              ? user.registration.hallImages[0]
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}&background=0D8ABC&color=fff`;
            return (
              <div
                key={user._id}
                onClick={() => onUserClick(user)}
                className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-150 gap-3 group ${
                  selectedConversation?._id === user._id
                    ? "bg-gray-100 text-[#7a1313] shadow-md"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full bg-center bg-cover border-2 border-white shadow group-hover:shadow-md transition"
                  style={{ backgroundImage: `url(${venueImage})` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-base text-gray-800">{`${user.firstName} ${user.lastName}`}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {user.lastMessage ? user.lastMessage : "No messages"}
                  </div>
                  {user.timeAgo && (
                    <div className="text-xs text-gray-300">{user.timeAgo}</div>
                  )}
                </div>
                <SlOptionsVertical className={`text-lg ${selectedConversation?._id === user._id ? "text-[#7a1313]" : "text-gray-300 group-hover:text-[#7a1313]"}`} />
              </div>
            );
          })
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
      <div className="flex-1 flex items-center justify-center bg-white rounded-3xl shadow-lg">
        <h3 className="text-gray-300 text-lg font-medium">Select a user to chat</h3>
      </div>
    );
  }

  const groupedMessages = groupMessages(messages);
  const selectedVenueImage = selectedConversation.registration && selectedConversation.registration.hallImages && selectedConversation.registration.hallImages.length > 0 && selectedConversation.registration.hallImages[0]
    ? selectedConversation.registration.hallImages[0]
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(`${selectedConversation.firstName} ${selectedConversation.lastName}`)}&background=0D8ABC&color=fff`;

  return (
    <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-cover bg-center rounded-full border-2 border-white shadow"
            style={{ backgroundImage: `url(${selectedVenueImage})` }}
          />
          <div
            className="font-semibold text-gray-800 cursor-pointer hover:underline text-lg tracking-tight"
            onClick={() => open({ id: selectedConversation._id })}
          >
            {`${selectedConversation.firstName} ${selectedConversation.lastName}`}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 mt-2 custom-scrollbar" ref={messagesRef}>
        {groupedMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-300">
            No messages yet. Start a conversation!
          </div>
        ) : (
          groupedMessages.map((group, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="text-center text-xs text-gray-300 font-medium">
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
                        className="w-8 h-8 rounded-full bg-center bg-cover border-2 border-white shadow"
                        style={{ backgroundImage: `url(${selectedVenueImage})` }}
                      />
                    )}
                    <div
                      className={`rounded-2xl px-5 py-3 shadow-md text-sm font-medium transition-all duration-150 ${
                        authUser === msg.senderId
                          ? "bg-gradient-to-br from-gray-100 to-white text-[#7a1313] rounded-br-3xl"
                          : "bg-white/90 text-gray-700 rounded-bl-3xl"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-[10px] text-gray-300 text-right mt-1 font-normal">
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
        <div className="text-xs italic text-gray-400 mt-2">
          {`${selectedConversation.firstName} ${selectedConversation.lastName}`} is typing...
        </div>
      )}

      <form
        className="flex items-center gap-3 mt-6 bg-white/70 rounded-full px-4 py-2 shadow border border-gray-100"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 bg-transparent border-none focus:ring-0 text-base"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="bg-[#7a1313] hover:bg-[#a33a3a] text-white px-4 py-2 rounded-full shadow-md transition-all duration-150"
        >
          <BsSendFill className="text-lg" />
        </button>
      </form>
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