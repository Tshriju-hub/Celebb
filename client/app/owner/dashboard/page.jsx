"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import OwnerSidebar from "@/components/Sidebar/OwnerSidebar";
import { useSession } from "next-auth/react";
import VenueDetails from "./components/VenueDetails";
import BookingStats from "./components/BookingStats";
import ErrorDisplay from "./components/ErrorDisplay";
import { FaExclamationTriangle } from "react-icons/fa";

export default function OwnerDashboard() {
  const [venues, setVenues] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({
    approved: 0,
    declined: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      localStorage.setItem('token', session.user.token);
      fetchData();
    } else if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const token = session?.user?.token || localStorage.getItem('token');
      if (!token) {
        console.error('No session token found');
        setError("Please log in to view dashboard");
        return;
      }

      // Fetch Venue Details
      const venueRes = await axios.post(
        "http://localhost:5000/api/auth/registrations/owner",
        { ownerId: session.user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Venue Response:", venueRes.data);
      setVenues(venueRes.data);

      // Check if venue is rejected
      if (venueRes.data.length > 0 && venueRes.data[0].status === 'rejected') {
        localStorage.removeItem('token');
        window.location.href = '/login?error=venue_rejected';
        return;
      }

      // Only fetch bookings if venue is approved
      if (venueRes.data.length > 0 && venueRes.data[0].status === 'approved') {
        const bookingsRes = await axios.get(
          "http://localhost:5000/api/bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log("Bookings Response:", bookingsRes.data);
        const bookings = bookingsRes.data.bookings || [];

        const counts = {
          approved: bookings.filter(b => b.status === "approved").length,
          declined: bookings.filter(b => b.status === "declined").length,
          pending: bookings.filter(b => b.status === "pending").length,
        };

        console.log("Booking counts:", counts);
        setBookingCounts(counts);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="p-8 text-lg text-gray-600">Loading session...</p>;
  }

  const isVenuePending = venues.length > 0 && venues[0].status === 'pending';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Owner Dashboard</h1>

        <ErrorDisplay error={error} />

        {isVenuePending && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-400 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Venue Verification Pending</h3>
                <p className="text-yellow-700">
                  Your venue registration is currently under review. This process typically takes up to 72 hours. 
                  During this time, you will only have access to the dashboard. Once your venue is verified, 
                  you'll have access to all features including bookings, messages, and services.
                </p>
                <p className="text-yellow-700 mt-2 font-medium">
                  Note: If your venue registration is rejected, your account will be permanently suspended.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Render All Venues */}
        {loading ? (
          <p>Loading venue details...</p>
        ) : venues.length > 0 ? (
          venues.map((venue, index) => (
            <VenueDetails key={index} venue={venue} />
          ))
        ) : (
          <p>No venue details available</p>
        )}

        {!isVenuePending && <BookingStats bookingCounts={bookingCounts} />}
      </main>
    </div>
  );
}