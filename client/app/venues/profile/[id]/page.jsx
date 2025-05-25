'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { FiUser, FiMapPin, FiPhone, FiMail, FiCalendar, FiDollarSign, FiImage, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function VenueProfilePage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [serviceImages, setServiceImages] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'news'

  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        // Fetch venue details
        const venueResponse = await axios.get(`http://localhost:5000/api/auth/registrations/${id}`);
        setVenue(venueResponse.data);

        // Fetch service images for this venue
        const imagesResponse = await axios.get('http://localhost:5000/api/service-images');
        const venueImages = imagesResponse.data.filter(img => img.owner === venueResponse.data.owner);
        setServiceImages(venueImages);

        // Fetch news for this venue
        const newsResponse = await axios.get('http://localhost:5000/api/news');
        const venueNews = newsResponse.data.filter(item => item.owner === venueResponse.data.owner);
        setNews(venueNews);

      } catch (error) {
        console.error('Error fetching venue data:', error);
        setError('Failed to load venue information');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, [id]);

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

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7a1313] to-[#4a0c0c]">
        <main className="p-8">
          <div className="text-center py-12">
            <div className="text-white mb-4">{error || 'Venue not found'}</div>
            <Link href="/venues" className="px-6 py-3 bg-white text-[#7a1313] rounded-full hover:bg-gray-100 transition-colors font-semibold">
              Back to Venues
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7a1313] to-[#4a0c0c]">
      <main className="p-8">
        {/* Back Button */}
        <Link href={`/venues/${id}`} className="inline-flex items-center text-white hover:text-gray-200 mb-8 transition-colors">
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Venue Details</span>
        </Link>

        {/* Venue Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Venue Details */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">{venue.name}</h1>
              <div className="space-y-4 text-white/90">
                <div className="flex items-center gap-3">
                  <FiUser className="w-5 h-5" />
                  <span>{venue.ownerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="w-5 h-5" />
                  <span>{venue.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5" />
                  <span>{venue.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5" />
                  <span>{venue.ownerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-5 h-5" />
                  <span>Established: {venue.established}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-[#7a1313]">Donation QR Code</h3>
                  <p className="text-sm text-gray-600">Scan to support this venue</p>
                </div>
                <Image
                  src={venue.qrCode}
                  alt="Venue Donation QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">Scan to donate in ₹</p>
                  <p className="text-xs text-gray-500 mt-1">Your support helps us grow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">About</h2>
            <p className="text-white/90 leading-relaxed">{venue.description}</p>
          </div>

          {/* Categories */}
          <div className="mt-6 flex flex-wrap gap-2">
            {venue.category?.split(',').map((cat, index) => (
              <span key={index} className="px-4 py-2 bg-white/20 text-white rounded-full text-sm">
                {cat.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 rounded-full transition-colors ${
              activeTab === 'images'
                ? 'bg-white text-[#7a1313]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Service Images
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-6 py-3 rounded-full transition-colors ${
              activeTab === 'news'
                ? 'bg-white text-[#7a1313]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            News & Updates
          </button>
        </div>

        {/* Content */}
        {activeTab === 'images' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceImages.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white/10 backdrop-blur-sm rounded-2xl">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <FiImage className="w-full h-full text-white/50" />
                </div>
                <p className="text-white/70 text-lg">No service images available yet.</p>
              </div>
            ) : (
              serviceImages.map((image) => (
                <div key={image._id} className="group bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
                  <div className="relative aspect-square">
                    <Image
                      src={image.imageUrl}
                      alt={`${venue.name} Service`}
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
                    <div className="text-sm text-white/70 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {news.length === 0 ? (
              <div className="text-center py-16 bg-white/10 backdrop-blur-sm rounded-2xl">
                <p className="text-white/70 text-lg">No news or updates available yet.</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item._id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/90 mb-4">{item.content}</p>
                  <div className="text-sm text-white/70 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
} 