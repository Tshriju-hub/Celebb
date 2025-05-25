"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { FaNewspaper, FaBuilding, FaUsers, FaChartLine, FaCalendarCheck } from 'react-icons/fa';
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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

        // Fetch venues using the correct endpoint
        const venuesRes = await axios.get("http://localhost:5000/api/auth/registrations", {
          headers: { Authorization: `Bearer ${session.user.token}` }
        });
        
        // Log the venues data for debugging
        console.log('Fetched venues:', venuesRes.data);
        
        // Update venues state
        setVenues(venuesRes.data);

        // Calculate venue statistics with logging
        const approvedVenues = venuesRes.data.filter(v => v.status === "approved").length;
        const pendingVenues = venuesRes.data.filter(v => v.status === "pending").length;
        const rejectedVenues = venuesRes.data.filter(v => v.status === "rejected").length;
        const bannedVenues = venuesRes.data.filter(v => v.status === "banned").length;

        console.log('Venue status counts:', {
          approved: approvedVenues,
          pending: pendingVenues,
          rejected: rejectedVenues,
          banned: bannedVenues
        });

        // Update venue status data with all statuses
        const venueStatusData = {
          labels: ['Approved', 'Pending', 'Rejected', 'Banned'],
          datasets: [{
            data: [approvedVenues, pendingVenues, rejectedVenues, bannedVenues],
            backgroundColor: ['#4CAF50', '#FFA726', '#EF5350', '#9E9E9E'],
            borderColor: ['#388E3C', '#F57C00', '#D32F2F', '#616161'],
            borderWidth: 1,
          }]
        };

        // Fetch news using the correct endpoint
        const newsRes = await axios.get("http://localhost:5000/api/news");
        setNews(newsRes.data);

        // Fetch users using the correct endpoint
        const usersRes = await axios.get("http://localhost:5000/api/user/getallusers", {
          headers: { Authorization: `Bearer ${session.user.token}` }
        });
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

  const toggleMenu = (userId) => {
    setMenuOpenId((prev) => (prev === userId ? null : userId));
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
              {/* Total Users */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
                    View all users →
                  </Link>
                </div>
              </div>

              {/* Total Venues */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Venues</p>
                    <h3 className="text-2xl font-bold text-gray-800">{venues.length}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaBuilding className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/admin/venues" className="text-sm text-green-600 hover:text-green-800">
                    View all venues →
                  </Link>
                </div>
              </div>

              {/* Total News */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total News</p>
                    <h3 className="text-2xl font-bold text-gray-800">{news.length}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaNewspaper className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/admin/news" className="text-sm text-purple-600 hover:text-purple-800">
                    View all news →
                  </Link>
                </div>
              </div>
            </div>

            {/* Venue Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Venue Status Distribution</h2>
              <div className="h-64 flex justify-center">
                <div className="w-1/2">
                  <Pie data={venueStatusData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} />
                </div>
              </div>
            </div>

            {/* Recent Venues */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Venue Requests</h2>
                <Link href="/admin/venues" className="text-sm text-[#7a1313] hover:text-[#5a0e0e]">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {venues.slice(0, 5).map((venue) => (
                  <div key={venue._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{venue.name}</p>
                      <p className="text-sm text-gray-500">{venue.ownerName}</p>
                    </div>
                    <div className="flex items-center gap-4">
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

export default AdminDashboard;
