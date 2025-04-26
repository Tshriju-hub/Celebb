"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { FaUser, FaLock, FaBell, FaGlobe, FaShieldAlt } from "react-icons/fa";
import Image from "next/image";

export default function UserSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    bookingUpdates: true,
    promotionalEmails: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (status === "authenticated" && session?.user?.token) {
        try {
          const response = await axios.get("http://localhost:5000/api/auth/user", {
            headers: {
              Authorization: `Bearer ${session.user.token}`,
            },
          });
          setUserDetails(response.data.user);
          setFormData({
            firstName: response.data.user.firstName || "",
            lastName: response.data.user.lastName || "",
            email: response.data.user.email || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setNotifications(response.data.user.notificationSettings || {
            emailNotifications: true,
            bookingUpdates: true,
            promotionalEmails: false,
          });
          setPrivacy(response.data.user.privacySettings || {
            profileVisibility: "public",
            showEmail: false,
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to fetch user details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, [status, session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = async (setting) => {
    try {
      const updatedNotifications = {
        ...notifications,
        [setting]: !notifications[setting],
      };
      
      const response = await axios.put(
        "http://localhost:5000/api/user/settings/notifications",
        updatedNotifications,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      
      setNotifications(updatedNotifications);
      toast.success("Notification settings updated successfully");
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification settings");
    }
  };

  const handlePrivacyChange = async (setting, value) => {
    try {
      const updatedPrivacy = {
        ...privacy,
        [setting]: value,
      };
      
      const response = await axios.put(
        "http://localhost:5000/api/user/settings/privacy",
        updatedPrivacy,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      
      setPrivacy(updatedPrivacy);
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:5000/api/user/profile",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const response = await axios.put(
        "http://localhost:5000/api/user/password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      toast.success("Password updated successfully");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden">
            {userDetails?.profileImage ? (
              <Image
                src={userDetails.profileImage}
                alt={`${userDetails.firstName} ${userDetails.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#7a1313] flex items-center justify-center">
                <span className="text-white text-2xl">
                  {userDetails?.firstName?.[0]}{userDetails?.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#7a1313]">
              {userDetails?.firstName} {userDetails?.lastName}
            </h1>
            <p className="text-gray-600">
              {userDetails?.provider === "google" ? userDetails?.email : userDetails?.username}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <FaUser className="text-[#7a1313] text-xl" />
              <h3 className="text-xl font-bold text-[#7a1313]">Profile Settings</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                />
              </div>
              {userDetails?.provider === "local" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={userDetails?.username || ""}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#7a1313] text-white py-2 px-4 rounded-md hover:bg-[#5e0f0f] transition"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <FaLock className="text-[#7a1313] text-xl" />
              <h3 className="text-xl font-bold text-[#7a1313]">Password Settings</h3>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#7a1313] text-white py-2 px-4 rounded-md hover:bg-[#5e0f0f] transition"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <FaBell className="text-[#7a1313] text-xl" />
              <h3 className="text-xl font-bold text-[#7a1313]">Notification Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email notifications about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationChange("emailNotifications")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a1313]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1313]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Booking Updates</h4>
                  <p className="text-sm text-gray-500">Get notified about your booking status changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.bookingUpdates}
                    onChange={() => handleNotificationChange("bookingUpdates")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a1313]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1313]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Promotional Emails</h4>
                  <p className="text-sm text-gray-500">Receive emails about special offers and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.promotionalEmails}
                    onChange={() => handleNotificationChange("promotionalEmails")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a1313]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1313]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <FaShieldAlt className="text-[#7a1313] text-xl" />
              <h3 className="text-xl font-bold text-[#7a1313]">Privacy Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7a1313] focus:ring-[#7a1313]"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Email Address</h4>
                  <p className="text-sm text-gray-500">Display your email address on your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={() => handlePrivacyChange("showEmail", !privacy.showEmail)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a1313]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1313]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 