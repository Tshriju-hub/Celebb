'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiUser, FiImage, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function MakeupGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venues, setVenues] = useState({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Remove token requirement and directly fetch images
        const response = await axios.get('http://localhost:5000/api/service-images?category=makeup');
        setImages(response.data);

        // Fetch venue details for each owner using the correct endpoint
        const ownerIds = [...new Set(response.data.map(img => img.owner))];
        const venuePromises = ownerIds.map(ownerId =>
          fetchVenueDetails(ownerId)
        );
        
        await Promise.all(venuePromises);
      } catch (error) {
        console.error('Error fetching images:', error);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const fetchVenueDetails = async (ownerId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/registrations/owner', {
        ownerId: ownerId
      });
      if (response.data && response.data.length > 0) {
        setVenues(prev => ({
          ...prev,
          [ownerId]: response.data[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching venue details:', error);
    }
  };

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
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-white hover:text-gray-200 mb-8 transition-colors">
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Home</span>
        </Link>

        {/* Header with Decorative SVG */}
        <div className="relative mb-12">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Makeup Services Gallery</h1>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
          <svg className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <svg className="w-full h-full text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/70 text-lg">No makeup service images available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image) => (
              <div key={image._id} className="group bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
                <div className="relative aspect-square">
                  <Image
                    src={image.imageUrl}
                    alt="Makeup Service"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      console.error('Image failed to load:', image.imageUrl);
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  {venues[image.owner] && (
                    <div className="flex items-center space-x-3 text-white">
                      <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{venues[image.owner].name}</span>
                    </div>
                  )}
                  <div className="mt-3 text-sm text-white/70 flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
