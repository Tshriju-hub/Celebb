'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import OwnerSidebar from '@/components/Sidebar/OwnerSidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUploadCloud, FiTrash2 } from 'react-icons/fi';

const categories = [
  { id: 'makeup', title: 'Makeup Services', description: 'Upload images showcasing your makeup services and transformations' },
  { id: 'decor', title: 'Decoration Services', description: 'Share images of your stunning decoration setups and themes' },
  { id: 'entertainment', title: 'Entertainment Services', description: 'Display images of your entertainment arrangements and events' }
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ServicesPage() {
  const router = useRouter();
  const [images, setImages] = useState({
    makeup: [],
    decor: [],
    entertainment: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: '', message: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchImages();
  }, [router]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/service-images', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Group images by category
      const groupedImages = {
        makeup: response.data.filter(img => img.category === 'makeup'),
        decor: response.data.filter(img => img.category === 'decor'),
        entertainment: response.data.filter(img => img.category === 'entertainment')
      };
      setImages(groupedImages);
    } catch (error) {
      setToastMsg({ type: 'error', message: 'Failed to fetch images' });
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateImage = (file) => {
    if (!file) {
      setToastMsg({ type: 'error', message: 'Please select an image file' });
      return false;
    }

    if (!file.type.startsWith('image/')) {
      setToastMsg({ type: 'error', message: 'Please upload an image file (JPEG, PNG, etc.)' });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setToastMsg({ type: 'error', message: `Image size should be less than ${formatFileSize(MAX_FILE_SIZE)}` });
      return false;
    }

    return true;
  };

  const handleImageUpload = async (category, file) => {
    if (!file || !validateImage(file)) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/service-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setToastMsg({ type: 'success', message: 'Image uploaded successfully' });
      fetchImages();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      setToastMsg({ type: 'error', message: errorMessage });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/service-images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToastMsg({ type: 'success', message: 'Image deleted successfully' });
      fetchImages();
    } catch (error) {
      setToastMsg({ type: 'error', message: 'Failed to delete image' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <OwnerSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#7a1313]">Manage Service Images</h1>

        {toastMsg.message && (
          <div
            className={`mb-4 px-4 py-3 rounded ${
              toastMsg.type === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
            role="alert"
          >
            {toastMsg.message}
          </div>
        )}

        <div className="space-y-8">
          {categories.map(category => (
            <div key={category.id} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#7a1313]">{category.title}</h2>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Maximum file size: {formatFileSize(MAX_FILE_SIZE)}</p>
                </div>
                
                {/* Upload Button */}
                <div className="flex-shrink-0">
                  <input
                    type="file"
                    id={`${category.id}-upload`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(category.id, e.target.files[0])}
                    disabled={uploading}
                  />
                  <label
                    htmlFor={`${category.id}-upload`}
                    className={`flex items-center gap-2 px-6 py-3 ${
                      uploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#7a1313] hover:bg-[#8f1717] cursor-pointer'
                    } text-white rounded-lg transition-colors duration-200`}
                  >
                    <FiUploadCloud className="w-5 h-5" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                  </label>
                </div>
              </div>

              {/* Images Grid */}
              <div className="mt-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7a1313] mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading images...</p>
                  </div>
                ) : (
                  <>
                    {images[category.id].length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images[category.id].map((image) => (
                          <div key={image._id} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                              <Image
                                src={image.imageUrl}
                                alt={`${category.title} image`}
                                fill
                                className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                            </div>
                            <button
                              onClick={() => handleDeleteImage(image._id)}
                              className="absolute top-2 right-2 p-2.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                              title="Delete image"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FiUploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No images uploaded yet</p>
                        <p className="text-gray-400 text-sm mt-1">Upload some images to showcase your {category.title.toLowerCase()}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 
