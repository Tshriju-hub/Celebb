"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [editingVenue, setEditingVenue] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewVenue, setPreviewVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('images');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Create the default layout plugin instance inside the component
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/getvenue");
        setVenues(response.data);
      } catch (error) {
        toast.error("Failed to fetch venues");
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await axios.post(
          `http://localhost:5000/api/auth/delete-venue`,
          { id }
        );
        toast.success("Venue deleted successfully");
        setVenues((prev) => prev.filter((v) => v._id !== id));
      } catch (error) {
        toast.error("Failed to delete venue");
      }
    }
  };

  const approveVenue = async (id) => {
    if (window.confirm("Are you sure you want to approve this venue?")) {
      try {
        await axios.post(`http://localhost:5000/api/auth/approve-venue`, { id });
        toast.success("Venue approved successfully");
        setVenues((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: "approved" } : v))
        );
      } catch (error) {
        toast.error("Failed to approve venue");
      }
    }
  };

  const banVenue = async (id) => {
    if (window.confirm("Are you sure you want to ban this venue?")) {
      try {
        await axios.post(`http://localhost:5000/api/auth/ban-venue`, { id });
        toast.success("Venue banned successfully");
        setVenues((prev) => 
          prev.map((v) => (v._id === id ? { ...v, status: "banned" } : v))
        );
      } catch (error) {
        toast.error("Failed to ban venue");
      }
    }
  };

  const unbanVenue = async (id) => {
    if (window.confirm("Are you sure you want to unban this venue?")) {
      try {
        await axios.post(`http://localhost:5000/api/auth/approve-venue`, { id });
        toast.success("Venue unbanned successfully");
        setVenues((prev) =>
          prev.map((v) => (v._id === id ? { ...v, status: "approved" } : v))
        );
      } catch (error) {
        toast.error("Failed to unban venue");
      }
    }
  };

  const handleUpdate = async (updatedVenue) => {
    try {
      await axios.put(
        `http://localhost:5000/api/auth/registrations/${updatedVenue._id}`,
        updatedVenue
      );
      toast.success("Venue updated successfully");
      setVenues((prev) =>
        prev.map((v) => (v._id === updatedVenue._id ? updatedVenue : v))
      );
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Failed to update venue");
    }
  };

  const prepareCSVData = () => {
    return venues.map((venue) => ({
      Name: venue.name,
      Owner: venue.ownerName,
      Email: venue.ownerEmail,
      Phone: venue.ownerPhone,
      Address: venue.address,
      Capacity: venue.capacity,
      Halls: venue.numberOfHalls,
      "Advance Payment": venue.advancePayment,
      "Food Silver": venue.foodSilverPrice,
      "Food Gold": venue.foodGoldPrice,
      "Food Diamond": venue.foodDiamondPrice,
      Makeup: venue.makeupPrice,
      Decoration: venue.decorationPrice,
      Entertainment: venue.entertainmentPrice,
      Status: venue.status,
    }));
  };

  const openPreviewModal = (venue) => {
    setPreviewVenue(venue);
    setCurrentIndex(0);
    setViewMode('images');
    setPageNumber(1);
    setPdfUrl(null);
    setIsPreviewModalOpen(true);
  };

  useEffect(() => {
    if (previewVenue && viewMode === 'documents') {
      console.log('Preview Venue Data:', previewVenue); // Debug log for venue data
      const url = currentIndex === 0 ? previewVenue.ownerCitizenship[0] : previewVenue.companyRegistration[0];
      console.log('Raw URL from venue:', url); // Debug log for raw URL
      
      if (url && typeof url === 'string') {
        // Cloudinary URLs are already complete URLs, no need to modify them
        console.log('Using Cloudinary URL:', url); // Debug log for Cloudinary URL
        setPdfUrl(url);
        setPdfLoading(true);
      } else {
        console.log('Invalid URL:', url); // Debug log for invalid URL
        setPdfUrl(null);
        setPdfLoading(false);
      }
    }
  }, [previewVenue, viewMode, currentIndex]);

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewVenue(null);
  };

  function onDocumentLoadSuccess({ numPages }) {
    console.log('PDF loaded successfully with', numPages, 'pages'); // Debug log
    setNumPages(numPages);
    setPdfLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error); // Debug log
    setPdfLoading(false);
  }

  // Summary counts
  const approvedCount = venues.filter((v) => v.status === "approved").length;
  const pendingCount = venues.filter((v) => v.status === "pending").length;
  const rejectedCount = venues.filter((v) => v.status === "rejected").length;
  const bannedCount = venues.filter((v) => v.status === "banned").length;

  // Add this function to check if the URL exists
  const checkUrlExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking URL:', error);
      return false;
    }
  };

  // Update the PDF viewer section
  const renderPdfViewer = (urls, documentType) => {
    if (!urls || urls.length === 0) {
      return <div className="text-gray-500">No {documentType} document available</div>;
    }

    const cloudinaryUrl = urls[0]; // Get the first URL from the array
    const proxyUrl = `http://localhost:5000/api/auth/pdf?url=${encodeURIComponent(cloudinaryUrl)}`;
    console.log('PDF URL:', proxyUrl); // Debug log

    // Function to handle PDF loading errors
    const handleError = (error) => {
      console.error('Error loading PDF:', error);
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <p>Failed to load PDF</p>
          <p className="text-sm">Please check if the file is accessible</p>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => window.open(cloudinaryUrl, '_blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Open in New Tab
            </button>
            <button 
              onClick={() => {
                // Try to fetch the PDF through the proxy
                fetch(proxyUrl)
                  .then(response => {
                    if (response.ok) {
                      window.open(proxyUrl, '_blank');
                    } else {
                      toast.error('Failed to access PDF');
                    }
                  })
                  .catch(error => {
                    console.error('Error fetching PDF:', error);
                    toast.error('Failed to access PDF');
                  });
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Try Alternative Access
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="w-full h-full overflow-auto">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={proxyUrl}
            plugins={[defaultLayoutPluginInstance]}
            defaultScale={1}
            onError={handleError}
            renderLoader={(percentages) => (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7a1313] border-t-transparent"></div>
              </div>
            )}
          />
        </Worker>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#7a1313]">Venue Management</h1>
          <CSVLink
            data={prepareCSVData()}
            filename="venues.csv"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-md transition-colors"
          >
            Export to CSV
          </CSVLink>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Approved</h2>
            <p className="text-2xl">{approvedCount}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Pending</h2>
            <p className="text-2xl">{pendingCount}</p>
          </div>
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Rejected</h2>
            <p className="text-2xl">{rejectedCount}</p>
          </div>
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Banned</h2>
            <p className="text-2xl">{bannedCount}</p>
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7a1313] border-t-transparent"></div>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No venues available.</p>
          </div>
        ) : (
          venues.map((venue) => (
            <div
              key={venue._id}
              className="bg-white p-6 rounded-xl shadow-lg mb-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Venue Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl text-[#7a1313] font-semibold">{venue.name}</h2>
                  <p className="text-gray-600 mt-1">{venue.address}</p>
                </div>
                <span
                  className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                    venue.status === "approved"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : venue.status === "rejected"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">👤</span>
                    <div>
                      <p className="font-medium text-gray-700">{venue.ownerName}</p>
                      <p className="text-sm text-gray-500">Owner</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">📧</span>
                    <p className="text-gray-600">{venue.ownerEmail}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">📱</span>
                    <p className="text-gray-600">{venue.ownerPhone}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Venue Capacity</p>
                    <p className="font-medium text-gray-700">{venue.capacity} guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Halls</p>
                    <p className="font-medium text-gray-700">{venue.numberOfHalls}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Advance Payment</p>
                    <p className="font-medium text-gray-700">Rs. {venue.advancePayment}</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                {venue.status === "approved" && (
                  <button
                    onClick={() => banVenue(venue._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                  >
                    Ban
                  </button>
                )}
                {venue.status === "banned" && (
                  <button
                    onClick={() => unbanVenue(venue._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                  >
                    Unban
                  </button>
                )}
                <button
                  onClick={() => handleDelete(venue._id)}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => openPreviewModal(venue)}
                  className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200"
                >
                  Preview
                </button>
                {venue.status === "pending" && (
                  <button
                    onClick={() => approveVenue(venue._id)}
                    className="px-4 py-2 bg-[#7a1313] text-white rounded-lg hover:bg-[#5a0e0e] transition-all duration-200"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Preview Modal */}
        {isPreviewModalOpen && previewVenue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-[75%] h-[95%] max-w-6xl shadow-xl space-y-6 relative overflow-y-auto">
              {/* View Mode Toggle */}
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setViewMode('images')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'images'
                      ? 'bg-[#7a1313] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hall Images
                </button>
                <button
                  onClick={() => setViewMode('documents')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'documents'
                      ? 'bg-[#7a1313] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Documents
                </button>
              </div>

              {/* Dynamic Title */}
              <h2 className="text-xl font-semibold text-[#7a1313]">
                {viewMode === 'images' 
                  ? `Hall Image ${currentIndex + 1}`
                  : currentIndex === 0
                    ? "Owner Citizenship"
                    : "Company Certificate"}
              </h2>

              {/* Content Viewer */}
              <div className="relative h-[60vh] bg-gray-100 rounded-lg overflow-hidden">
                {viewMode === 'images' ? (
                  // Image Viewer
                  <img
                    src={previewVenue.hallImages[currentIndex]}
                    alt={`Hall ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // PDF Viewer
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                    {pdfLoading && (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7a1313] border-t-transparent"></div>
                      </div>
                    )}
                    {currentIndex === 0 
                      ? renderPdfViewer(previewVenue.ownerCitizenship, 'citizenship')
                      : renderPdfViewer(previewVenue.companyRegistration, 'company registration')
                    }
                  </div>
                )}

                {/* Navigation Buttons - Only show for images */}
                {viewMode === 'images' && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentIndex(currentIndex === 0 ? previewVenue.hallImages.length - 1 : currentIndex - 1);
                      }}
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={() => {
                        setCurrentIndex(currentIndex === previewVenue.hallImages.length - 1 ? 0 : currentIndex + 1);
                      }}
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity"
                    >
                      &gt;
                    </button>
                  </>
                )}

                {/* Page Indicator - Only show for images */}
                {viewMode === 'images' && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
                    {`${currentIndex + 1} / ${previewVenue.hallImages.length}`}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {viewMode === 'images' ? (
                <div className="flex space-x-2 justify-center mt-4">
                  {previewVenue.hallImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`h-16 w-24 object-cover rounded cursor-pointer border-2 ${
                        currentIndex === idx ? 'border-[#7a1313]' : 'border-transparent'
                      }`}
                      onClick={() => setCurrentIndex(idx)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex space-x-4 justify-center mt-4">
                  <button
                    onClick={() => setCurrentIndex(0)}
                    className={`px-4 py-2 rounded-md ${
                      currentIndex === 0
                        ? 'bg-[#7a1313] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Owner Citizenship
                  </button>
                  <button
                    onClick={() => setCurrentIndex(1)}
                    className={`px-4 py-2 rounded-md ${
                      currentIndex === 1
                        ? 'bg-[#7a1313] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Company Certificate
                  </button>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={closePreviewModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
                >
                  Close
                </button>
                {previewVenue.status === "pending" && (
                  <button
                    onClick={() => approveVenue(previewVenue._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md transition-colors"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(previewVenue._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md shadow-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueManagement;