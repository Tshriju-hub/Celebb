"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";

const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [editingVenue, setEditingVenue] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewVenue, setPreviewVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the index of the current image in the carousel

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
    setCurrentIndex(0); // Reset the carousel index
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewVenue(null);
  };

  // Carousel navigation
  const handlePrev = () => {
    if (currentIndex === 0) {
      setCurrentIndex(previewVenue.hallImages.length - 1); // Loop back to the last image
    } else {
      setCurrentIndex(currentIndex - 1); // Go to the previous image
    }
  };

  const handleNext = () => {
    if (currentIndex === previewVenue.hallImages.length - 1) {
      setCurrentIndex(0); // Loop back to the first image
    } else {
      setCurrentIndex(currentIndex + 1); // Go to the next image
    }
  };

  // Summary counts
  const approvedCount = venues.filter((v) => v.status === "approved").length;
  const pendingCount = venues.filter((v) => v.status === "pending").length;
  const rejectedCount = venues.filter((v) => v.status === "rejected").length;
  const bannedCount = venues.filter((v) => v.status === "banned").length;

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
              {/* Dynamic Title */}
              <h2 className="text-xl font-semibold text-[#7a1313]">
                {currentIndex < previewVenue.hallImages.length
                  ? `Hall Image ${currentIndex + 1}`
                  : currentIndex === previewVenue.hallImages.length
                  ? "Owner Citizenship"
                  : "Company Certificate"}
              </h2>

              {/* Carousel for All Images */}
              <div className="relative">
                {currentIndex < previewVenue.hallImages.length ? (
                  <img
                    src={previewVenue.hallImages[currentIndex]}
                    alt={`Hall ${currentIndex + 1}`}
                    className="w-full rounded-md shadow-lg h-[60vh] object-cover"
                  />
                ) : currentIndex === previewVenue.hallImages.length ? (
                  <img
                    src={previewVenue.ownerCitizenship}
                    alt="Owner Citizenship"
                    className="w-full rounded-md shadow-lg h-[60vh] object-cover"
                  />
                ) : (
                  <img
                    src={previewVenue.companyRegistration}
                    alt="Company Certificate"
                    className="w-full rounded-md shadow-lg h-[60vh] object-cover"
                  />
                )}

                {/* Left Arrow Button */}
                <button
                  onClick={() => {
                    if (currentIndex === 0) {
                      setCurrentIndex(previewVenue.hallImages.length + 1);
                    } else {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }}
                  className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full z-10"
                >
                  &lt;
                </button>
                {/* Right Arrow Button */}
                <button
                  onClick={() => {
                    if (currentIndex === previewVenue.hallImages.length + 1) {
                      setCurrentIndex(0);
                    } else {
                      setCurrentIndex(currentIndex + 1);
                    }
                  }}
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full z-10"
                >
                  &gt;
                </button>
                {/* Image Index */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {currentIndex + 1} / {previewVenue.hallImages.length + 2}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex space-x-2 justify-center mt-2">
                {previewVenue.hallImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`h-12 w-16 object-cover rounded cursor-pointer border-2 ${currentIndex === idx ? "border-[#7a1313]" : "border-transparent"}`}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
                <img
                  src={previewVenue.ownerCitizenship}
                  alt="Owner Citizenship"
                  className={`h-12 w-16 object-cover rounded cursor-pointer border-2 ${currentIndex === previewVenue.hallImages.length ? "border-[#7a1313]" : "border-transparent"}`}
                  onClick={() => setCurrentIndex(previewVenue.hallImages.length)}
                />
                <img
                  src={previewVenue.companyRegistration}
                  alt="Company Certificate"
                  className={`h-12 w-16 object-cover rounded cursor-pointer border-2 ${currentIndex === previewVenue.hallImages.length + 1 ? "border-[#7a1313]" : "border-transparent"}`}
                  onClick={() => setCurrentIndex(previewVenue.hallImages.length + 1)}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={closePreviewModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => approveVenue(previewVenue._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md transition-colors"
                >
                  Approve
                </button>
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