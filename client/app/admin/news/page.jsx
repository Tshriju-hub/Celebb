"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/news/");
        setNews(response.data);
      } catch (error) {
        toast.error("Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Delete news
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/news/${id}`);
        toast.success("News deleted successfully");
        setNews(prev => prev.filter(n => n._id !== id));
      } catch (error) {
        toast.error("Failed to delete news");
      }
    }
  };

  // Update news
  const handleUpdate = async (updatedNews) => {
    try {
      await axios.put(
        `http://localhost:5000/api/news/${updatedNews._id}`,
        updatedNews
      );
      toast.success("News updated successfully");
      setNews(prev => 
        prev.map(n => n._id === updatedNews._id ? updatedNews : n)
      );
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Failed to update news");
    }
  };

  // Prepare CSV data
  const prepareCSVData = () => {
    return news.map(item => ({
      Title: item.title,
      Description: item.description,
      Date: new Date(item.date).toLocaleDateString(),
      Owner: item.owner ? item.owner.firstName + " " + item.owner.lastName : "Unknown",
    }));
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">News Management</h1>
          <CSVLink 
            data={prepareCSVData()} 
            filename="news.csv"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Export to CSV
          </CSVLink>
        </div>

        {loading ? (
          <p className="text-center">Loading news...</p>
        ) : news.length === 0 ? (
          <p className="text-center text-lg text-gray-700">No news available.</p>
        ) : (
          news.map((newsItem) => (
            <div key={newsItem._id} className="bg-white p-6 rounded-lg shadow-lg mb-6 space-y-4">
              <h2 className="text-2xl text-[#7a1313] font-semibold">{newsItem.title}</h2>
              <p className="text-gray-700">{newsItem.description}</p>
              <img src={newsItem.image} alt={newsItem.title} className="w-full h-auto rounded-md mt-4" />
              <p className="text-gray-500 mt-2">{new Date(newsItem.date).toLocaleDateString()}</p>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingNews(newsItem);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(newsItem._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit News</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editingNews?.title || ''}
                  onChange={(e) => setEditingNews({...editingNews, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingNews?.description || ''}
                  onChange={(e) => setEditingNews({...editingNews, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={editingNews?.image || ''}
                  onChange={(e) => setEditingNews({...editingNews, image: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editingNews)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
