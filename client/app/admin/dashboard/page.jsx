"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { FaNewspaper, FaBuilding, FaUsers } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [newsCount, setNewsCount] = useState(0);
  const [venueCount, setVenueCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const newsResponse = await axios.get("http://localhost:5000/api/news");
        const venueResponse = await axios.get("http://localhost:5000/api/auth/registrations");
        const usersResponse = await axios.get("http://localhost:5000/api/user/getallusers");

        setNewsCount(newsResponse.data.length);
        setVenueCount(venueResponse.data.length);
        setUserCount(usersResponse.data.length);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Failed to fetch counts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const approveUser = async (userId) => {
    if (window.confirm("Approve this user?")) {
      try {
        await axios.post("http://localhost:5000/api/auth/approve-user", { userId });
        toast.success("User approved");
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, status: "approved" } : user
          )
        );
      } catch (error) {
        toast.error("Failed to approve user");
        console.error(error);
      }
    }
  };

  const banUser = async (userId) => {
    if (window.confirm("Ban this user?")) {
      try {
        await axios.post("http://localhost:5000/api/auth/ban-user", { userId });
        toast.success("User banned");
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, status: "banned" } : user
          )
        );
      } catch (error) {
        toast.error("Failed to ban user");
        console.error(error);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Delete this user permanently?")) {
      try {
        await axios.delete(`http://localhost:5000/api/user/delete/${userId}`);
        toast.success("User deleted");
        setUsers((prev) => prev.filter((user) => user._id !== userId));
      } catch (error) {
        toast.error("Failed to delete user");
        console.error(error);
      }
    }
  };

  const toggleMenu = (userId) => {
    setMenuOpenId((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-[#F7F7F7] overflow-y-auto relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#7a1313]">Welcome, Admin!</h1>
        </div>

        {loading ? (
          <p className="text-center text-lg text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">Total News</h2>
                    <p className="text-3xl font-bold text-[#7a1313]">{newsCount}</p>
                  </div>
                  <div className="bg-[#7a1313] text-white p-4 rounded-full">
                    <FaNewspaper className="text-3xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">Total Venues</h2>
                    <p className="text-3xl font-bold text-[#7a1313]">{venueCount}</p>
                  </div>
                  <div className="bg-[#7a1313] text-white p-4 rounded-full">
                    <FaBuilding className="text-3xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">Total Users</h2>
                    <p className="text-3xl font-bold text-[#7a1313]">{userCount}</p>
                  </div>
                  <div className="bg-[#7a1313] text-white p-4 rounded-full">
                    <FaUsers className="text-3xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="bg-white p-6 rounded-lg shadow-lg mt-10 relative">
              <h2 className="text-xl font-bold mb-4 text-[#7a1313]">User List</h2>
              <div className="overflow-x-auto w-full">
                <table className="min-w-[1100px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Username</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Role</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{user.username}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 capitalize">{user.role}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              user.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : user.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : user.status === "banned"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 relative">
                          <button
                            onClick={() => toggleMenu(user._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <BsThreeDotsVertical className="text-xl" />
                          </button>

                          {menuOpenId === user._id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-2 w-40 bg-white shadow-lg border border-gray-200 rounded-md z-50"
                            >
                              <ul className="py-1">
                                {user.status === "pending" && (
                                  <li>
                                    <button
                                      onClick={() => {
                                        approveUser(user._id);
                                        setMenuOpenId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                      Approve User
                                    </button>
                                  </li>
                                )}
                                {
                                  user.status !== "banned" && (
                                    <li>
                                  <button
                                    onClick={() => {
                                      banUser(user._id);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Ban User
                                  </button>
                                </li>
                                  )
                                }
                                
                                <li>
                                  <button
                                    onClick={() => {
                                      deleteUser(user._id);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                  >
                                    Delete User
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
