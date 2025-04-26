"use client";

import { useEffect, useState } from "react";
import axios from "axios"; // Import axios for making API calls

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaUserCircle, FaSignOutAlt, FaCog, FaUser } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { motion } from "framer-motion";

export default function ProfilePopup({ onClose }) {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState(""); // State for user role
  const [username, setUsername] = useState(""); // State for username
  const [loading, setLoading] = useState(true); // State for loading
  const [userImage, setUserImage] = useState(null); // State for user image
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // If user is logged in with Google
        if (session?.user) {
          setUserDetails({
            ...session.user,
            provider: "google"
          });
          // For Google login, use the part before @ in email as username
          const emailUsername = session.user.email.split('@')[0];
          setUsername(emailUsername);
          setUserImage(session.user.image);
          setUserRole("user");
          setLoading(false);
          return;
        }

        // If user is logged in with local account
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            setUserRole(decoded.role || "user");
            
            const response = await axios.get('http://localhost:5000/api/auth/user', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            setUserDetails(response.data.user);
            setUsername(response.data.user.username);
            if (response.data.user.avatar) {
              setUserImage(response.data.user.avatar);
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [session]);

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

  if (loading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden profile-popup border border-gray-100"
    >
      {/* User Profile Header */}
      <div className="bg-gradient-to-r from-[#6D0C0E] to-[#9b1e1e] p-4 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            {userImage ? (
              <img 
                src={userImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                {userDetails?.firstName && userDetails?.lastName ? (
                  <span className="text-white text-lg font-medium">
                    {userDetails.firstName[0]}{userDetails.lastName[0]}
                  </span>
                ) : (
                  <FaUser className="text-white text-xl" />
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base">{username || "User"}</h3>
            <p className="text-sm text-white/80">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <Link
          href={dashboardPath}
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          onClick={onClose}
        >
          <div className="bg-[#6D0C0E]/10 p-2 rounded-full">
            <MdDashboard className="text-[#6D0C0E]" />
          </div>
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/user/dashboard"
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          onClick={onClose}
        >
          <div className="bg-[#6D0C0E]/10 p-2 rounded-full">
            <FaUser className="text-[#6D0C0E]" />
          </div>
          <span className="font-medium">Profile</span>
        </Link>

        <Link
          href="/user/settings"
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          onClick={onClose}
        >
          <div className="bg-[#6D0C0E]/10 p-2 rounded-full">
            <FaCog className="text-[#6D0C0E]" />
          </div>
          <span className="font-medium">Settings</span>
        </Link>

        <div className="border-t border-gray-100 my-2"></div>

        <button
          className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          onClick={async () => {
            await signOut({ redirect: false });
            localStorage.removeItem("token");
            onClose();
            window.location.href = "/";
          }}
        >
          <div className="bg-red-100 p-2 rounded-full">
            <FaSignOutAlt className="text-red-600" />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
}
