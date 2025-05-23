'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import OwnerSidebar from '@/components/Sidebar/OwnerSidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUploadCloud } from 'react-icons/fi';
import { FaExclamationTriangle, FaCheck } from 'react-icons/fa';

export default function OwnerNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState({ type: '', message: '' });
  const [imageError, setImageError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchNews();
  }, [router]);

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/news', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNews(res.data);
    } catch (error) {
      setToastMsg({ type: 'error', message: 'Failed to fetch news' });
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateImage = (file) => {
    setImageError('');

    if (!file) {
      return false;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPEG, PNG, etc.)');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError(`Image size should be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      if (file) {
        if (validateImage(file)) {
          setFormData({ ...formData, image: file });
          setImagePreview(URL.createObjectURL(file));
        } else {
          e.target.value = ''; // Reset file input
          setFormData({ ...formData, image: null });
          setImagePreview(null);
        }
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowUploadConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/news/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        setToastMsg({ type: 'success', message: 'News updated successfully' });
      } else {
        await axios.post('http://localhost:5000/api/news', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        setToastMsg({ type: 'success', message: 'News created successfully' });
      }
      setFormData({ title: '', description: '', image: null });
      setImagePreview(null);
      setEditingId(null);
      setImageError('');
      setShowUploadConfirmModal(false);
      fetchNews();
    } catch (error) {
      setToastMsg({ type: 'error', message: error.response?.data?.message || 'Operation failed' });
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      image: null
    });
    setImagePreview(item.image);
    setEditingId(item._id);
    setImageError(''); // Reset image error when editing
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/news/${newsToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setToastMsg({ type: 'success', message: 'News deleted successfully' });
      setShowDeleteModal(false);
      setNewsToDelete(null);
      fetchNews();
    } catch (error) {
      setToastMsg({ type: 'error', message: error.response?.data?.message || 'Failed to delete news' });
      if (error.response?.status === 401) {
        router.push('/login');
      }
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
              <label className="block mb-2 text-sm font-medium text-gray-700">Image</label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#7a1313] transition-colors duration-200"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FiUploadCloud className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-400">
                      Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                    </span>
                  </div>
                </label>
              </div>
              {imageError && (
                <p className="mt-2 text-sm text-red-600">{imageError}</p>
              )}
              {imagePreview && (
                <div className="mt-4">
                  <div className="relative w-48 h-32">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setImagePreview(null);
                      setImageError('');
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove image
                  </button>
                </div>
              )}
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
                    setFormData({ title: '', description: '', image: null });
                    setImagePreview(null);
                    setEditingId(null);
                    setImageError('');
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
                    <div className="flex gap-4">
                      {item.image && (
                        <div className="relative w-24 h-24">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-[#7a1313]">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 border border-[#7a1313] text-[#7a1313] rounded hover:bg-[#f2dcdc] text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setNewsToDelete(item);
                          setShowDeleteModal(true);
                        }}
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-center text-red-600 mb-4">
                <FaExclamationTriangle className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "{newsToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setNewsToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Confirmation Modal */}
        {showUploadConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-center text-green-600 mb-4">
                <FaCheck className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">
                Confirm {editingId ? 'Update' : 'Upload'}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to {editingId ? 'update' : 'upload'} this news article?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowUploadConfirmModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmedSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

