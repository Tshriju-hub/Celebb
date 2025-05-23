import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const url = 'http://localhost:5000';

const useGetOwnerConversations = () => {
  const [loading, setLoading] = useState(true);
  const [finalConversations, setFinalConversations] = useState([]);
  const [middlewareConversations, setMiddlewareConversations] = useState([]);
  const [lastMessage, setLastMessage] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const getConversations = async () => {
      if (!storedToken) {
        toast.error("No token found.");
        return;
      }

      try {
        console.log("Fetching conversations...");

        // Fetching conversations data
        const res = await axios.get(`${url}/messages/getownerconversations`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        console.log("Conversations response:", JSON.stringify(res.data, null, 2));
        setMiddlewareConversations(res.data);

        // Fetching last message data
        const resLastMessage = await axios.get(`${url}/messages/getLastMessage`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        console.log("Last message response:", JSON.stringify(resLastMessage.data, null, 2));
        setLastMessage(resLastMessage.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []);

  useEffect(() => {
    if (middlewareConversations.length > 0 && lastMessage.length > 0) {
      console.log("Processing conversations...");
      console.log("Middleware conversations:", JSON.stringify(middlewareConversations, null, 2));
      console.log("Last messages:", JSON.stringify(lastMessage, null, 2));

      const combinedConversations = middlewareConversations.map(conversation => {
        const userId = conversation._id;
        console.log("Processing conversation for user:", userId);

        if (!userId) {
          console.warn("UserId not found for conversation:", conversation);
          return { ...conversation, lastMessage: "", timeAgo: "" };
        }

        // Find the last message by matching participants
        const lastMsg = lastMessage.find(msg => {
          const hasParticipant = msg.participants.some(p => p._id === userId);
          console.log("Checking message:", msg._id, "for user:", userId, "match:", hasParticipant);
          return hasParticipant;
        });

        const result = {
          ...conversation,
          lastMessage: lastMsg?.lastMessage?.message || "",
          timeAgo: lastMsg?.timeAgo || "",
        };
        console.log("Combined result for user:", userId, result);
        return result;
      });

      console.log("Final combined conversations:", JSON.stringify(combinedConversations, null, 2));
      setFinalConversations(combinedConversations);
    }
  }, [middlewareConversations, lastMessage]);

  return { loading, finalConversations };
};

export default useGetOwnerConversations;
