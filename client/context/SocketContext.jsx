'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState({});
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === 'loading') return;

		const userId = session?.user?.id;
		if (!userId) {
			console.log('No user ID available');
			return;
		}

		console.log('Initializing socket connection...');
		const newSocket = io('http://localhost:5000', {
			query: { userId },
			transports: ['polling', 'websocket'],
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 10000,
			auth: session?.user?.token ? { token: session.user.token } : undefined,
			forceNew: true,
			autoConnect: true
		});

		newSocket.on('connect', () => {
			console.log('Socket connected successfully');
		});

		newSocket.on('connect_error', (error) => {
			console.error('Socket connection error:', error);
			if (error.message.includes('Missing userId')) {
				console.error('Missing userId in socket connection');
			}
		});

		newSocket.on('disconnect', (reason) => {
			console.log('Socket disconnected:', reason);
		});

		newSocket.on('getOnlineUsers', (users) => {
			console.log('Received online users:', users);
			setOnlineUsers(users);
		});

		setSocket(newSocket);

		return () => {
			console.log('Cleaning up socket connection...');
			if (newSocket) {
				newSocket.disconnect();
			}
		};
	}, [session, status]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
