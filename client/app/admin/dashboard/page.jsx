"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { FaNewspaper, FaBuilding, FaUsers } from 'react-icons/fa';
import { toast } from "react-toastify";
import Link from "next/link";
import { useSession } from 'next-auth/react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.token) {
          toast.error('Please log in to view dashboard');
          return;
        }

        // Fetch venues
        const venuesRes = await axios.get("http://localhost:5000/api/auth/registrations", {
          headers: { Authorization: `Bearer ${session.user.token}` }
        });
        console.log('Fetched venues:', venuesRes.data); // Debug log
        setVenues(venuesRes.data);

        // Fetch news
        const newsRes = await axios.get("http://localhost:5000/api/news");
        setNews(newsRes.data);

        // Fetch users with proper endpoint and auth
        const usersRes = await axios.get("http://localhost:5000/api/users/getallusers", {
          headers: {
            Authorization: `Bearer ${session.user.token}`
          }
        });
        console.log('Fetched users in dashboard:', usersRes.data); // Debug log
        setUsers(usersRes.data);

      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.token) {
      fetchData();
    }
  }, [session]);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Here's what's happening in your system</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7a1313] border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Users */}
              <DashboardStat title="Total Users" count={users.length} icon={<FaUsers className="w-6 h-6 text-blue-600" />} color="blue" href="/admin/users" />
              {/* Venues */}
              <DashboardStat title="Total Venues" count={venues.length} icon={<FaBuilding className="w-6 h-6 text-green-600" />} color="green" href="/admin/venues" />
              {/* News */}
              <DashboardStat title="Total News" count={news.length} icon={<FaNewspaper className="w-6 h-6 text-purple-600" />} color="purple" href="/admin/news" />
            </div>

            {/* Recent Venues */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Venue Requests</h2>
                <Link href="/admin/venues" className="text-sm text-[#7a1313] hover:text-[#5a0e0e]">View all</Link>
              </div>
              <div className="space-y-4">
                {venues.slice(0, 5).map((venue) => (
                  <div key={venue._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{venue.name}</p>
                      <p className="text-sm text-gray-500">{venue.ownerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      venue.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : venue.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {venue.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const DashboardStat = ({ title, count, icon, color, href }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
      </div>
      <div className={`bg-${color}-100 p-3 rounded-full`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <Link href={href} className={`text-sm text-${color}-600 hover:text-${color}-800`}>
        View all {title.toLowerCase()} →
      </Link>
    </div>
  </div>
);

export default AdminDashboard;
