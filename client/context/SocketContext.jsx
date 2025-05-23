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
		if (typeof window !== 'undefined') {
			const storedToken = localStorage.getItem('token');
			if (storedToken) {
				try {
					const decoded = JSON.parse(atob(storedToken.split('.')[1]));
					setToken(decoded.userId);
				} catch (error) {
					console.error('Error decoding token:', error);
				}
			}
		}
	}, []);

	useEffect(() => {
		if (!token) return;

		const newSocket = io('http://localhost:5000', {
			query: { userId: token },
			transports: ['websocket', 'polling'],
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 10000
		});

		newSocket.on('connect', () => {
			console.log('Socket connected successfully');
		});

		newSocket.on('connect_error', (error) => {
			console.error('Socket connection error:', error);
		});

		newSocket.on('getOnlineUsers', (users) => {
			setOnlineUsers(users);
		});

		setSocket(newSocket);

		return () => {
			if (newSocket) {
				newSocket.disconnect();
			}
		};
	}, [token]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
