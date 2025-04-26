"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import OwnerSidebar from "@/components/Sidebar/OwnerSidebar";

const OwnerBookings = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [declinedBookings, setDeclinedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      const allBookings = res.data.bookings || [];

      setPendingBookings(allBookings.filter((b) => b.status === "pending"));
      setApprovedBookings(allBookings.filter((b) => b.status === "approved"));
      setDeclinedBookings(allBookings.filter((b) => b.status === "declined"));
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, {
        status,
      });

      setPendingBookings((prev) => prev.filter((b) => b._id !== id));

      if (status === "approved") {
        setApprovedBookings((prev) => [...prev, pendingBookings.find((b) => b._id === id)]);
      } else if (status === "declined") {
        setDeclinedBookings((prev) => [...prev, pendingBookings.find((b) => b._id === id)]);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const renderMenuItems = (menu) => {
    const entries = [];

    Object.entries(menu || {}).forEach(([section, subSection]) => {
      Object.entries(subSection || {}).forEach(([key, value]) => {
        if (value?.items?.length) {
          entries.push(
            <p key={section + key}>
              <strong>{section} - {key}:</strong> {value.items.join(", ")}
            </p>
          );
        } else if (typeof value === "object") {
          Object.entries(value || {}).forEach(([subKey, subVal]) => {
            if (subVal?.length) {
              entries.push(
                <p key={section + key + subKey}>
                  <strong>{section} - {key} - {subKey}:</strong> {subVal.join(", ")}
                </p>
              );
            }
          });
        }
      });
    });

    return entries.length ? entries : <p>No menu selected.</p>;
  };

  const BookingCard = ({ booking, showActions = false }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-[#7a1313]">
      <h2 className="text-2xl font-semibold text-[#7a1313] mb-3">
        {booking.eventType || "Event Booking"}
      </h2>
      <p><strong>Full Name:</strong> {booking.fullName}</p>
      <p><strong>Email:</strong> {booking.email}</p>
      <p><strong>Phone 1:</strong> {booking.phone1}</p>
      {booking.phone2 && <p><strong>Phone 2:</strong> {booking.phone2}</p>}
      <p><strong>Address:</strong> {booking.address}</p>
      <p><strong>Event Time:</strong> {booking.eventTime}</p>
      <p><strong>Total Guests:</strong> {booking.totalGuests}</p>
      <p><strong>Event Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {booking.status}</p>

      {booking.hall?.length > 0 && (
        <p><strong>Hall(s):</strong> {booking.hall.join(", ")}</p>
      )}
      {booking.catering?.length > 0 && (
        <p><strong>Catering:</strong> {booking.catering.join(", ")}</p>
      )}
      {booking.menuInstructions && (
        <p><strong>Menu Instructions:</strong> {booking.menuInstructions}</p>
      )}

      <div className="mt-3">
        <h3 className="font-semibold text-[#7a1313]">Menu Items:</h3>
        {renderMenuItems(booking.menu)}
      </div>

      {showActions && (
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => updateStatus(booking._id, "approved")}
            className="px-6 py-2 bg-[#7a1313] text-white rounded-md hover:bg-[#6d0e0e]"
          >
            Approve
          </button>
          <button
            onClick={() => updateStatus(booking._id, "declined")}
            className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  const renderTab = (bookings, showActions = false, emptyText = "No bookings found.") => {
    return bookings.length === 0 ? (
      <p className="text-gray-500">{emptyText}</p>
    ) : (
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} showActions={showActions} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      <OwnerSidebar />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex mb-6 border-b space-x-4">
          {["pending", "approved", "declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? "text-[#7a1313] border-b-2 border-[#7a1313]"
                  : "text-gray-500"
              }`}
            >
              {tab} ({tab === "pending" ? pendingBookings.length : tab === "approved" ? approvedBookings.length : declinedBookings.length})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-[#7a1313]">Loading...</p>
        ) : activeTab === "pending" ? (
          renderTab(pendingBookings, true, "No pending bookings found.")
        ) : activeTab === "approved" ? (
          renderTab(approvedBookings, false, "No approved bookings found.")
        ) : (
          renderTab(declinedBookings, false, "No declined bookings found.")
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;
