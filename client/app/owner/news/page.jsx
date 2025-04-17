'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import OwnerSidebar from '@/components/Sidebar/OwnerSidebar';

export default function OwnerNewsPage() {
  const [news, setNews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/news');
      setNews(res.data);
    } catch (error) {
      setToastMsg({ type: 'error', message: 'Failed to fetch news' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/news/${editingId}`, formData);
        setToastMsg({ type: 'success', message: 'News updated successfully' });
      } else {
        await axios.post('http://localhost:5000/api/news', formData);
        setToastMsg({ type: 'success', message: 'News created successfully' });
      }
      setFormData({ title: '', description: '', image: '' });
      setEditingId(null);
      fetchNews();
    } catch (error) {
      setToastMsg({ type: 'error', message: 'Operation failed' });
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/news/${id}`);
      setToastMsg({ type: 'success', message: 'News deleted successfully' });
      fetchNews();
    } catch {
      setToastMsg({ type: 'error', message: 'Failed to delete news' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <OwnerSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#7a1313]">Manage News</h1>

        {toastMsg.message && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              toastMsg.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {toastMsg.message}
          </div>
        )}

        {/* News Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#7a1313]">
            {editingId ? 'Edit News' : 'Add New News'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#7a1313]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#7a1313]"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#7a1313]"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-[#7a1313] text-white px-4 py-2 rounded hover:bg-[#5c0f0f]"
              >
                {editingId ? 'Update News' : 'Add News'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ title: '', description: '', image: '' });
                    setEditingId(null);
                  }}
                  className="border border-[#7a1313] text-[#7a1313] px-4 py-2 rounded hover:bg-[#f2dcdc]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* News List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-[#7a1313]">News List</h2>
          {loading ? (
            <p>Loading news...</p>
          ) : news.length === 0 ? (
            <p className="text-gray-500">No news items found</p>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item._id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#7a1313]">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 border border-[#7a1313] text-[#7a1313] rounded hover:bg-[#f2dcdc] text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
