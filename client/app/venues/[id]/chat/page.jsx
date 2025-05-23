"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";
import Image from "next/image";
import { Undo2, SendHorizonal } from "lucide-react";

let socket;

export default function VenueChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [owner, setOwner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [fetchingMessages, setFetchingMessages] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAuthUser(payload.userId || payload._id);
      } catch {
        setAuthUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const fetchVenue = async () => {
      const res = await axios.get(`http://localhost:5000/api/auth/registrations/${id}`);
      setVenue(res.data);
      setOwner(res.data.owner);
    };
    fetchVenue();
  }, [id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!owner || !authUser) return;
      setFetchingMessages(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`http://localhost:5000/messages/${owner}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(data);
      } catch {
        setMessages([]);
      } finally {
        setFetchingMessages(false);
      }
    };
    fetchMessages();
  }, [owner, authUser]);

  useEffect(() => {
    if (!venue || !owner) return;
    socket = io("http://localhost:5000");
    socket.emit("joinVenueRoom", id);
    socket.on("venueMessage", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.disconnect();
  }, [venue, owner, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !owner) return;
    const msg = {
      message: input,
      senderId: authUser,
      receiverId: owner,
      createdAt: new Date().toISOString(),
    };
    socket.emit("venueMessage", { roomId: id, ...msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");

    const token = localStorage.getItem("token");
    axios.post(`http://localhost:5000/messages/send/${owner}`, { message: input }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  if (!venue || !authUser) return (
    <div className="h-screen flex items-center justify-center text-xl text-gray-600">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a1313]" />
    </div>
  );

  const backgroundImage = venue.hallImages?.[0] || "/Image/venues/venue1.png";

  return (
    <div className="h-screen w-screen relative">
      {/* Background image */}
      <Image
        src={backgroundImage}
        alt="Venue Background"
        layout="fill"
        objectFit="cover"
        className="z-0 brightness-75" // Less blur/dark than before
      />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10" /> {/* Softer blur */}

      {/* Floating Back Icon */}
      <button
        onClick={() => router.push(`/venues/${id}`)}
        className="absolute top-4 left-4 z-30 p-3 bg-white/70 hover:bg-white text-[#7a1313] rounded-full shadow-md"
      >
        <Undo2 />
      </button>

      {/* Chatbox */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b">
            <Image
              src={venue.hallImages?.[0] || "/Image/venues/venue1.png"}
              alt={venue.name}
              width={40}
              height={40}
              className="rounded-full object-cover border shadow"
            />
            <div>
              <h2 className="text-base font-semibold text-[#7a1313]">{venue.name}</h2>
              <p className="text-sm text-gray-400">Chat with owner</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {fetchingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-b-2 border-[#7a1313]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">No messages yet.</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === authUser ? "justify-end" : "justify-start"}`}>
                  <div className={`px-4 py-2 text-sm max-w-[75%] rounded-2xl shadow ${msg.senderId === authUser
                    ? "bg-[#7a1313] text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}>
                    {msg.message}
                    <div className="text-xs mt-1 text-right text-gray-300">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center p-3 border-t bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message"
              className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7a1313]"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-[#7a1313] hover:bg-[#611010] p-2 rounded-full text-white shadow-md"
            >
              <SendHorizonal size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
