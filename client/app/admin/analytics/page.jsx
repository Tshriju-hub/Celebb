"use client";
import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { FaChartBar, FaChartLine, FaChartPie, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venues, setVenues] = useState([]);
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [venueStatusData, setVenueStatusData] = useState({
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#4CAF50', '#FFA726', '#EF5350'],
      borderColor: ['#388E3C', '#F57C00', '#D32F2F'],
      borderWidth: 1,
    }]
  });
  const [venueTypesData, setVenueTypesData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderColor: ['#FF4F6E', '#2196F3', '#FFC107', '#00BCD4', '#7C4DFF'],
      borderWidth: 1,
    }]
  });
  const [userRegistrationData, setUserRegistrationData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Monthly Registrations',
        data: [],
        backgroundColor: 'rgba(33, 150, 243, 0.5)',
        borderColor: '#2196F3',
        borderWidth: 2,
        type: 'bar'
      },
      {
        label: 'Total Users',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        type: 'line',
        fill: true,
        tension: 0.4
      }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.token) {
          setError('Please log in to view analytics');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${session.user.token}` };

        // Fetch analytics data
        const analyticsRes = await axios.get("http://localhost:5000/api/analytics", { headers })
          .catch(err => {
            console.error('Analytics fetch error:', err);
            throw new Error(err.response?.data?.error || 'Failed to fetch analytics data');
          });

        if (!analyticsRes.data) {
          throw new Error('No data received from analytics endpoint');
        }

        // Update state with analytics data
        const { counts, recentBookings, recentVenues, analytics } = analyticsRes.data;
        
        setVenues(recentVenues || []);
        setNews(Array(counts.news).fill({}));
        setUsers(Array(counts.users).fill({}));
        setBookings(recentBookings || []);

        // Update venue status chart data
        setVenueStatusData({
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [{
            data: [
              analytics.venueStatus.approved || 0,
              analytics.venueStatus.pending || 0,
              analytics.venueStatus.rejected || 0
            ],
            backgroundColor: ['#4CAF50', '#FFA726', '#EF5350'],
            borderColor: ['#388E3C', '#F57C00', '#D32F2F'],
            borderWidth: 1,
          }]
        });

        // Update venue types chart data
        setVenueTypesData({
          labels: analytics.venueDistribution.map(v => v.label),
          datasets: [{
            data: analytics.venueDistribution.map(v => v.value),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderColor: ['#FF4F6E', '#2196F3', '#FFC107', '#00BCD4', '#7C4DFF'],
            borderWidth: 1,
          }]
        });

        // Update user registration timeline data
        const currentYear = new Date().getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentYear, i);
          return date.toLocaleString('default', { month: 'short' });
        });

        setUserRegistrationData({
          labels: months,
          datasets: [
            {
              label: 'Monthly Registrations',
              data: analytics.bookingsByMonth || Array(12).fill(0),
              backgroundColor: 'rgba(33, 150, 243, 0.5)',
              borderColor: '#2196F3',
              borderWidth: 2,
              type: 'bar'
            },
            {
              label: 'Total Users',
              data: analytics.weeklyUsers || Array(12).fill(0),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderWidth: 2,
              type: 'line',
              fill: true,
              tension: 0.4
            }
          ]
        });

        setError(null);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(error.message || 'Failed to load analytics data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.token) {
      fetchData();
    }
  }, [session]);

  // Calculate average venue capacity
  const averageCapacity = venues.length > 0 
    ? Math.round(venues.reduce((sum, venue) => sum + Number(venue.capacity), 0) / venues.length)
    : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your business performance and growth</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            {error.includes('session has expired') && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Click here to refresh
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7a1313] border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Venues</p>
                    <h3 className="text-2xl font-bold text-gray-800">{venues.length}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaChartBar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Capacity</p>
                    <h3 className="text-2xl font-bold text-gray-800">{averageCapacity}</h3>
                    <p className="text-sm text-yellow-600 mt-1">guests per venue</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaChartLine className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total News</p>
                    <h3 className="text-2xl font-bold text-gray-800">{news.length}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaChartPie className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Venue Types</h2>
                <div className="h-80">
                  <Pie data={venueTypesData} options={{
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

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Venue Status</h2>
                <div className="h-80">
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

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">User Registration Timeline ({new Date().getFullYear()})</h2>
                <div className="h-80">
                  <Line data={userRegistrationData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value} users`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          callback: function(value) {
                            return value + ' users';
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>

            {/* Recent Venues Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Venues</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {venues.slice(0, 5).map((venue) => (
                      <tr key={venue._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{venue.ownerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{venue.capacity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            venue.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : venue.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {venue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 