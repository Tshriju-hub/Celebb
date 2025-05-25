"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { Dialog } from '@headlessui/react';
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

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

  const openConfirmDialog = (action, venueId) => {
    setConfirmAction(action);
    setSelectedVenueId(venueId);
    
    // Set appropriate confirmation message based on action
    switch (action) {
      case 'approve':
        setConfirmMessage('Are you sure you want to approve this venue? This will allow the venue to accept bookings.');
        break;
      case 'reject':
        setConfirmMessage('Are you sure you want to reject this venue? This will permanently suspend the owner\'s account.');
        break;
      case 'ban':
        setConfirmMessage('Are you sure you want to ban this venue? This will prevent the venue from accepting bookings.');
        break;
      case 'unban':
        setConfirmMessage('Are you sure you want to unban this venue? This will restore the venue\'s ability to accept bookings.');
        break;
      case 'delete':
        setConfirmMessage('Are you sure you want to delete this venue? This action cannot be undone.');
        break;
      default:
        setConfirmMessage('Are you sure you want to proceed with this action?');
    }
    
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      switch (confirmAction) {
        case 'approve':
          await axios.post(`http://localhost:5000/api/auth/approve-venue`, { id: selectedVenueId });
          toast.success("Venue approved successfully");
          setVenues((prev) =>
            prev.map((v) => (v._id === selectedVenueId ? { ...v, status: "approved" } : v))
          );
          break;
        case 'reject':
          await axios.post(`http://localhost:5000/api/auth/reject-venue`, { id: selectedVenueId });
          toast.success("Venue rejected successfully");
          setVenues((prev) =>
            prev.map((v) => (v._id === selectedVenueId ? { ...v, status: "rejected" } : v))
          );
          break;
        case 'ban':
          await axios.post(`http://localhost:5000/api/auth/ban-venue`, { id: selectedVenueId });
          toast.success("Venue banned successfully");
          setVenues((prev) => 
            prev.map((v) => (v._id === selectedVenueId ? { ...v, status: "banned" } : v))
          );
          break;
        case 'unban':
          await axios.post(`http://localhost:5000/api/auth/approve-venue`, { id: selectedVenueId });
          toast.success("Venue unbanned successfully");
          setVenues((prev) =>
            prev.map((v) => (v._id === selectedVenueId ? { ...v, status: "approved" } : v))
          );
          break;
        case 'delete':
          await axios.post(`http://localhost:5000/api/auth/delete-venue`, { id: selectedVenueId });
          toast.success("Venue deleted successfully");
          setVenues((prev) => prev.filter((v) => v._id !== selectedVenueId));
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${confirmAction} venue`);
      console.error(error);
    } finally {
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
      setSelectedVenueId(null);
      setConfirmMessage('');
    }
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
                {venue.status === "pending" && (
                  <>
                    <button
                      onClick={() => openConfirmDialog('approve', venue._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openConfirmDialog('reject', venue._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                {venue.status === "approved" && (
                  <button
                    onClick={() => openConfirmDialog('ban', venue._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                  >
                    Ban
                  </button>
                )}
                {venue.status === "banned" && (
                  <button
                    onClick={() => openConfirmDialog('unban', venue._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                  >
                    Unban
                  </button>
                )}
                <button
                  onClick={() => openConfirmDialog('delete', venue._id)}
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
              </div>
            </div>
          ))
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Confirm Action
              </Dialog.Title>
              
              <Dialog.Description className="text-sm text-gray-500 mb-6">
                {confirmMessage}
              </Dialog.Description>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 text-white rounded-lg transition-all duration-200 ${
                    confirmAction === 'delete' || confirmAction === 'ban' || confirmAction === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmAction === 'approve' || confirmAction === 'unban'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-[#7a1313] hover:bg-[#5a0e0e]'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Preview Modal */}
        {isPreviewModalOpen && previewVenue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-[75%] h-[95%] max-w-6xl shadow-xl space-y-6 relative overflow-y-auto">

              {/* Title */}
              <h2 className="text-xl font-semibold text-[#7a1313]">
                {(() => {
                  const hallImagesLength = previewVenue.hallImages.length;
                  const qrCodeIndex = hallImagesLength + 2; // After hall images, citizenship, and registration
                  
                  if (currentIndex < hallImagesLength) {
                    return `Hall Image ${currentIndex + 1}`;
                  } else if (currentIndex === hallImagesLength) {
                    const isPDF = (url) => {
                      if (typeof url !== 'string') return false;
                      return /\.pdf($|\?)/i.test(url) || url.includes('/raw/') || url.includes('/documents/');
                    };
                    const citizenshipFile = Array.isArray(previewVenue.ownerCitizenship) 
                      ? previewVenue.ownerCitizenship[0] 
                      : previewVenue.ownerCitizenship;
                    
                    return `Owner Citizenship ${isPDF(citizenshipFile) ? '(PDF)' : ''}`;
                  } else if (currentIndex === hallImagesLength + 1) {
                    const isPDF = (url) => {
                      if (typeof url !== 'string') return false;
                      return /\.pdf($|\?)/i.test(url) || url.includes('/raw/') || url.includes('/documents/');
                    };
                    const certificateFile = Array.isArray(previewVenue.companyRegistration) 
                      ? previewVenue.companyRegistration[0] 
                      : previewVenue.companyRegistration;
                    
                    return `Company Certificate ${isPDF(certificateFile) ? '(PDF)' : ''}`;
                  } else if (currentIndex === qrCodeIndex) {
                    return 'Donation QR Code';
                  }
                })()}
              </h2>

              {/* Preview Display */}
              <div className="relative">
                {(() => {
                  const totalImages = previewVenue.hallImages.length;
                  const files = [
                    ...previewVenue.hallImages,
                    previewVenue.ownerCitizenship,
                    previewVenue.companyRegistration,
                    previewVenue.qrCode // Add QR code to the files array
                  ].flat(); // Flatten arrays in case they contain arrays of URLs
                  const currentFile = files[currentIndex];

                  const isPDF = (url) => {
                    if (typeof url !== 'string') return false;
                    return /\.pdf($|\?)/i.test(url) || url.includes('/raw/') || url.includes('/documents/');
                  };

                  // Special handling for QR code display
                  if (currentIndex === files.length - 1 && previewVenue.qrCode) {
                    return (
                      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-gray-100 rounded-md shadow-lg p-8">
                        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Donation QR Code</h3>
                          <div className="flex justify-center mb-4">
                            <img
                              src={previewVenue.qrCode}
                              alt="Venue Donation QR Code"
                              className="w-64 h-64 object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-600 text-center mb-2">Scan to donate</p>
                          <p className="text-xs text-gray-500 text-center">Your support helps us grow</p>
                        </div>
                      </div>
                    );
                  }

                  return isPDF(currentFile) ? (
                    <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-gray-100 rounded-md shadow-lg">
                      <iframe
                        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(currentFile)}`}
                        title="PDF Preview"
                        className="w-full h-full rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          document.getElementById('pdf-fallback').style.display = 'flex';
                        }}
                      />
                      <div id="pdf-fallback" className="hidden absolute inset-0 flex-col items-center justify-center bg-gray-100">
                        <p className="text-gray-700 mb-4">PDF viewer couldn't load the document</p>
                        <a 
                          href={currentFile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#7a1313] text-white px-4 py-2 rounded hover:bg-[#5a0e0e]"
                        >
                          Open PDF in New Tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={currentFile}
                      alt={`Preview ${currentIndex + 1}`}
                      className="w-full h-[60vh] object-cover rounded-md shadow-lg"
                    />
                  );
                })()}

                {/* Navigation Arrows */}
                <button
                  onClick={() => {
                    const files = [
                      ...previewVenue.hallImages,
                      previewVenue.ownerCitizenship,
                      previewVenue.companyRegistration,
                      previewVenue.qrCode
                    ].flat();
                    const total = files.length;
                    setCurrentIndex((currentIndex - 1 + total) % total);
                  }}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full z-10 hover:bg-black hover:bg-opacity-80 transition"
                >
                  &lt;
                </button>

                <button
                  onClick={() => {
                    const files = [
                      ...previewVenue.hallImages,
                      previewVenue.ownerCitizenship,
                      previewVenue.companyRegistration,
                      previewVenue.qrCode
                    ].flat();
                    const total = files.length;
                    setCurrentIndex((currentIndex + 1) % total);
                  }}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full z-10 hover:bg-black hover:bg-opacity-80 transition"
                >
                  &gt;
                </button>

                {/* Index Indicator */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {currentIndex + 1} / {[...previewVenue.hallImages, previewVenue.ownerCitizenship, previewVenue.companyRegistration, previewVenue.qrCode].flat().length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {(() => {
                  const files = [
                    ...previewVenue.hallImages,
                    previewVenue.ownerCitizenship,
                    previewVenue.companyRegistration,
                    previewVenue.qrCode // Add QR code to thumbnails
                  ].flat();
                  
                  const isPDF = (url) => {
                    if (typeof url !== 'string') return false;
                    return /\.pdf($|\?)/i.test(url) || url.includes('/raw/') || url.includes('/documents/');
                  };

                  return files.map((file, idx) => {
                    // Special thumbnail for QR code
                    if (idx === files.length - 1 && previewVenue.qrCode) {
                      return (
                        <div
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-12 w-16 flex items-center justify-center bg-gray-200 rounded border-2 ${
                            currentIndex === idx ? 'border-[#7a1313]' : 'border-transparent'
                          } cursor-pointer hover:bg-gray-300 transition`}
                        >
                          <span className="text-xs text-gray-700 font-medium">QR</span>
                        </div>
                      );
                    }

                    return isPDF(file) ? (
                      <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-12 w-16 flex items-center justify-center bg-gray-200 rounded border-2 ${
                          currentIndex === idx ? 'border-[#7a1313]' : 'border-transparent'
                        } cursor-pointer hover:bg-gray-300 transition`}
                      >
                        <span className="text-xs text-gray-700 font-medium">PDF</span>
                      </div>
                    ) : (
                      <img
                        key={idx}
                        src={file}
                        alt={`Thumbnail ${idx + 1}`}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-12 w-16 object-cover rounded cursor-pointer border-2 ${
                          currentIndex === idx ? 'border-[#7a1313]' : 'border-transparent'
                        } hover:opacity-90 transition`}
                      />
                    );
                  });
                })()}
              </div>

              {/* Action Buttons */}
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