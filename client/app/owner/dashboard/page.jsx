"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import OwnerSidebar from "@/components/Sidebar/OwnerSidebar";
import { useSession } from "next-auth/react";
import VenueDetails from "./components/VenueDetails";
import BookingStats from "./components/BookingStats";
import ErrorDisplay from "./components/ErrorDisplay";

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

      // Fetch Bookings and Count by Status
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
    } catch (err) {
      console.error("Dashboard data fetch error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        // Token expired or invalid
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Owner Dashboard</h1>

        <ErrorDisplay error={error} />

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

        <BookingStats bookingCounts={bookingCounts} />
      </main>
    </div>
  );
}