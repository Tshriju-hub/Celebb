import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const url = 'http://localhost:5000';

const useGetOwnerConversations = () => {
  const [loading, setLoading] = useState(true);  // Start with loading as true
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
        console.log("Conversations response:", res.data);
        setMiddlewareConversations(res.data);

        // Fetching last message data
        const resLastMessage = await axios.get(`${url}/messages/getLastMessage`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        console.log("Last message response:", resLastMessage.data);
        setLastMessage(resLastMessage.data);

      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        toast.error(errorMessage);
      } finally {
        setLoading(false);  // Set loading to false when data is fetched
      }
    };

    getConversations();
  }, []);

  useEffect(() => {
    if (middlewareConversations.length > 0 && lastMessage.length > 0) {
      const combinedConversations = middlewareConversations.map(conversation => {
        const userId = conversation._id;

        if (!userId) {
          console.warn("UserId not found for conversation:", conversation);
          return { ...conversation, lastMessage: "", timeAgo: "" };
        }

        // Find the last message by matching senderId and receiverId with participants.
        const lastMsg = lastMessage.find(msg => 
        msg.participants.some(p => p._id === conversation._id)
      );

        return {
          ...conversation,
          lastMessage: lastMsg?.lastMessage.message || "",  // get message from lastMsg
          timeAgo: lastMsg?.timeAgo || "",      // get timeAgo from lastMsg
        };
      });

      setFinalConversations(combinedConversations);
    }
  }, [middlewareConversations, lastMessage]);  // Only run when both are updated

  return { loading, finalConversations };
};

export default useGetOwnerConversations;
