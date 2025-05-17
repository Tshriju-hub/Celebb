import { useEffect, useState } from "react";
import axios from "axios";
import useConversation from "./useConversation.js";
import toast from "react-hot-toast";
const url = "http://localhost:5000";

const useGetMessages = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
    const [token, setToken] = useState(null);

	useEffect(() => {
		const getMessages = async () => {
            const storedToken = localStorage.getItem("token");
            setToken(storedToken);

            if (!storedToken) {
                toast.error("No token found.");
                return;
            }
			setLoading(true);
			try {
				const { data } = await axios.get(`${url}/messages/${selectedConversation._id}`,
					{
						headers: {
            Authorization: `Bearer ${storedToken}`,
          },
					}
				);
				setMessages(data);
			} catch (error) {
				toast.error(error.response?.data?.error || error.message);
			} finally {
				setLoading(false);
			}
		};

		if (selectedConversation?._id) getMessages();
	}, [selectedConversation?._id, setMessages]);

	return { messages, loading };
};

export default useGetMessages;