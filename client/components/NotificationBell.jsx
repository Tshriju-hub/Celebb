"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaBell } from 'react-icons/fa';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { BsCircleFill } from 'react-icons/bs';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

const NotificationBell = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const getAuthToken = () => {
    if (session?.user?.token) {
      return session.user.token;
    }
    return localStorage.getItem('token');
  };

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchNotifications();
      fetchUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
      // Set up polling for new notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-gray-200 focus:outline-none"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#7a1313] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-4 border-b bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaBell className="w-5 h-5 text-[#7a1313]" />
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-sm text-[#7a1313] hover:text-[#5a0e0e] transition-colors"
                >
                  <IoCheckmarkDoneOutline className="w-4 h-4" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <FaBell className="w-8 h-8 mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {!notification.read && (
                      <BsCircleFill className="w-2 h-2 mt-2 text-[#7a1313]" />
                    )}
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 text-base block mb-1">
                        {notification.title}
                      </span>
                      <span className="text-sm text-gray-600 block mb-2">
                        {notification.message}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 