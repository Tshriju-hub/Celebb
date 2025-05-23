"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import OwnerSidebar from "@/components/Sidebar/OwnerSidebar";
import { useSession } from "next-auth/react";

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
    if (status === 'authenticated') {
      const token = session?.user?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      if (!session?.user?.token) {
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
            Authorization: `Bearer ${session.user.token}`
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
            Authorization: `Bearer ${session.user.token}`
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
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchData();
    }
  }, [session]);

  if (status === "loading") {
    return <p className="p-8 text-lg text-gray-600">Loading session...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Owner Dashboard</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
        )}

        {/* Render All Venues */}
        {loading ? (
          <p>Loading venue details...</p>
        ) : venues.length > 0 ? (
          venues.map((venue, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Venue Details</h2>

              {/* Venue Image */}
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={`${venue.hallImages?.[0] || "default.jpg"}`}
                  alt="Venue"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Owner Information</h3>
                  <p><strong>Name:</strong> {venue.ownerName}</p>
                  <p><strong>Email:</strong> {venue.ownerEmail}</p>
                  <p><strong>Phone:</strong> {venue.ownerPhone}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Venue Information</h3>
                  <p><strong>Name:</strong> {venue.name}</p>
                  <p><strong>Address:</strong> {venue.address}</p>
                  <p><strong>Phone:</strong> {venue.phone}</p>
                  <p><strong>Established:</strong> {venue.established}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Capacity</h3>
                  <p><strong>Space Preference:</strong> {venue.spacePreference}</p>
                  <p><strong>Total Capacity:</strong> {venue.capacity}</p>
                  <p><strong>Number of Halls:</strong> {venue.numberOfHalls}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Pricing</h3>
                  <p><strong>Advance Payment:</strong> Rs.{venue.advancePayment}</p>
                  <p><strong>Food Silver Price:</strong> Rs.{venue.foodSilverPrice}</p>
                  <p><strong>Food Gold Price:</strong> Rs.{venue.foodGoldPrice}</p>
                  <p><strong>Food Diamond Price:</strong> Rs.{venue.foodDiamondPrice}</p>
                  <p><strong>Makeup Price:</strong> Rs.{venue.makeupPrice}</p>
                  <p><strong>Decoration Price:</strong> Rs.{venue.decorationPrice}</p>
                  <p><strong>Entertainment Price:</strong> Rs.{venue.entertainmentPrice}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No venue details available</p>
        )}

        {/* Booking Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Approved Bookings</h3>
            <p className="text-2xl font-bold mt-2 text-green-600">{bookingCounts.approved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Declined Bookings</h3>
            <p className="text-2xl font-bold mt-2 text-red-600">{bookingCounts.declined}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">Pending Bookings</h3>
            <p className="text-2xl font-bold mt-2 text-yellow-600">{bookingCounts.pending}</p>
          </div>
        </div>
      </main>
    </div>
  );
}