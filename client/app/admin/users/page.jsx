"use client";
import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { FaUser, FaSearch, FaFilter, FaEllipsisV, FaCheck, FaTimes, FaBan, FaUnlock } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.token) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/getallusers', {
        headers: {
          Authorization: `Bearer ${session.user.token}`
        }
      });
      console.log('Fetched users:', response.data); // Debug log
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post('http://localhost:5000/api/auth/approve-user', 
        { userId },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`
          }
        }
      );
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.post('http://localhost:5000/api/auth/reject-user', 
        { userId },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`
          }
        }
      );
      toast.success('User rejected successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to reject user:', error);
      toast.error('Failed to reject user');
    }
  };

  const handleBan = async (userId) => {
    try {
      await axios.post('http://localhost:5000/api/auth/ban-user', 
        { userId },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`
          }
        }
      );
      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await axios.post('http://localhost:5000/api/auth/approve-user', 
        { userId },
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`
          }
        }
      );
      toast.success('User unbanned successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
      toast.error('Failed to unban user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' || 
      user.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor user accounts</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#7a1313]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-[#7a1313] bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a1313]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.role || 'User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'approved' ? 'bg-green-100 text-green-800' :
                          user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          user.status === 'banned' ? 'bg-gray-300 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(user._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(user._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <FaTimes className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {user.status !== 'banned' ? (
                            <button
                              onClick={() => handleBan(user._id)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Ban User"
                            >
                              <FaBan className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnban(user._id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Unban User"
                            >
                              <FaUnlock className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-gray-600 hover:text-gray-900"
                            title="More Options"
                          >
                            <FaEllipsisV className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;