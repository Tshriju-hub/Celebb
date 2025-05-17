'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState({});
	const [token, setToken] = useState(null);

	useEffect(() => {
		// Only run on client
		if (typeof window !== 'undefined') {
			const storedToken = localStorage.getItem('token');
			setToken(storedToken);
		}
	}, []);

	useEffect(() => {
		if (!token) return;
        console.log('Connecting to socket with token:', token);
		const newSocket = io('http://localhost:5000', {
			query: {
				userId: token,
			},
		});

		setSocket(newSocket);

		newSocket.on('getOnlineUsers', (users) => {
			setOnlineUsers(users);
		});

		return () => {
			newSocket.disconnect();
		};
	}, [token]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
