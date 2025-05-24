'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiUser, FiImage } from 'react-icons/fi';

export default function EntertainmentGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venues, setVenues] = useState({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view images');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get('http://localhost:5000/api/service-images?category=entertainment', config);
        setImages(response.data);

        // Fetch venue details for each owner
        const ownerIds = [...new Set(response.data.map(img => img.owner))];
        const venuePromises = ownerIds.map(ownerId =>
          axios.post('http://localhost:5000/api/auth/registrations/owner', { ownerId }, config)
        );
        
        const venueResponses = await Promise.all(venuePromises);
        const venueMap = {};
        venueResponses.forEach((res, index) => {
          if (res.data && res.data.length > 0) {
            venueMap[ownerIds[index]] = res.data[0];
          }
        });
        setVenues(venueMap);
      } catch (error) {
        console.error('Error fetching images:', error);
        if (error.response?.status === 401) {
          setError('Please log in to view images');
        } else {
          setError('Failed to load images');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7a1313] to-[#4a0c0c]">
        <main className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7a1313] to-[#4a0c0c]">
        <main className="p-8">
          <div className="text-center py-12">
            <div className="text-white mb-4">{error}</div>
            {error.includes('log in') && (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-3 bg-white text-[#7a1313] rounded-full hover:bg-gray-100 transition-colors font-semibold"
              >
                Go to Login
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7a1313] to-[#4a0c0c]">
      <main className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Entertainment Services Gallery</h1>
        
        {images.length === 0 ? (
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
            <FiImage className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">No entertainment service images available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image) => (
              <div key={image._id} className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <div className="relative aspect-square">
                  <Image
                    src={image.imageUrl}
                    alt="Entertainment Service"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', image.imageUrl);
                      e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                    }}
                  />
                </div>
                <div className="p-6">
                  {venues[image.owner] && (
                    <div className="flex items-center space-x-3 text-white">
                      <FiUser className="w-5 h-5" />
                      <span className="font-medium">{venues[image.owner].name}</span>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-white/70">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 
