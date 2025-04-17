"use client";

import { useEffect, useState } from "react";
import axios from "axios"; // Import axios for making API calls

import Link from "next/link";
import { signOut } from "next-auth/react";
import { FaUserCircle, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ProfilePopup({ onClose }) {
  const [userRole, setUserRole] = useState(""); // State for user role
  const [username, setUsername] = useState(""); // State for username
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserRole(decoded.role || "user"); // Set user role from token
      } catch (error) {
        console.error("Token parsing error:", error);
      }
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` // Send token in headers
          }
        });
        setUsername(response.data.username); // Set username from response
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserDetails(); // Call the function to fetch user details
  }, []);

  const dashboardPath =
    userRole === "owner"
      ? "/owner/dashboard"
      : userRole === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-popup')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden profile-popup"
    >
      <div className="p-4 border border-gray-200 rounded-lg">

        <Link
          href={dashboardPath}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
          onClick={onClose}
        >
          <FaTachometerAlt /> {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
        </Link>

        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition"
          onClick={async () => {
            await signOut({ redirect: false });
            localStorage.removeItem("token");
            onClose();
            window.location.href = "/";
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </motion.div>
  );
}
