"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import OwnerSidebar from "@/components/Sidebar/OwnerSidebar";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const OwnerBookings = () => {
  const { data: session } = useSession();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [declinedBookings, setDeclinedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState({ id: null, status: null });

  const fetchBookings = async () => {
    try {
      if (!session?.user?.token) {
        console.error('No session token found');
        toast.error("Please log in to view bookings");
        return;
      }

      console.log('Fetching bookings with session token');

      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${session.user.token}`
        }
      });

      console.log('Bookings response:', res.data);
      const allBookings = res.data.bookings || [];

      setPendingBookings(allBookings.filter((b) => b.status === "pending"));
      setApprovedBookings(allBookings.filter((b) => b.status === "approved"));
      setDeclinedBookings(allBookings.filter((b) => b.status === "declined"));
    } catch (error) {
      console.error("Error fetching bookings:", error.response?.data || error.message);
      toast.error("Failed to fetch bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchBookings();
    }
  }, [session]);

  const handleStatusUpdate = (id, status) => {
    setSelectedAction({ id, status });
    setShowConfirmDialog(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      if (!session?.user?.token) {
        console.error('No session token found');
        toast.error("Please log in to update booking status");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/bookings/${selectedAction.id}`, 
        { status: selectedAction.status },
        {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPendingBookings((prev) => prev.filter((b) => b._id !== selectedAction.id));
        const updatedBooking = response.data.booking;

        if (selectedAction.status === "approved") {
          setApprovedBookings((prev) => [...prev, updatedBooking]);
        } else if (selectedAction.status === "declined") {
          setDeclinedBookings((prev) => [...prev, updatedBooking]);
        }

        toast.success(`Booking ${selectedAction.status} successfully`);
      }
    } catch (err) {
      console.error("Error updating status:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update booking status");
    } finally {
      setShowConfirmDialog(false);
      setSelectedAction({ id: null, status: null });
    }
  };

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
            onClick={() => handleStatusUpdate(booking._id, "approved")}
            className="px-6 py-2 bg-[#7a1313] text-white rounded-md hover:bg-[#6d0e0e]"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(booking._id, "declined")}
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

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-[#7a1313] mb-4">
                Confirm {selectedAction.status === "approved" ? "Approval" : "Rejection"}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {selectedAction.status === "approved" ? "approve" : "reject"} this booking?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedAction({ id: null, status: null });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedAction.status === "approved"
                      ? "bg-[#7a1313] hover:bg-[#6d0e0e]"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  Confirm {selectedAction.status === "approved" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;
