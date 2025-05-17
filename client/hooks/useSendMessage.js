import { useState } from "react";
import useConversation from "./useConversation";
import axios from "axios";
import { toast } from 'react-toastify';
const url = 'http://localhost:5000';

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
	  const [token, setToken] = useState(null);

	const sendMessage = async (message) => {
		const storedToken = localStorage.getItem("token");
		setToken(storedToken);
		
		if (!storedToken) {
			toast.error("No token found.");
			return;
		}

		setLoading(true);
		try {
			const response = await axios.post(`${url}/messages/send/${selectedConversation._id}`, {
				message,
			}, {
				headers: {
            Authorization: `Bearer ${storedToken}`,
          },
			});

			const data = response.data;
			setMessages([...messages, data]);
		} catch (error) {
			// Handle error appropriately
			toast.error(error.response?.data?.error || error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export default useSendMessage;