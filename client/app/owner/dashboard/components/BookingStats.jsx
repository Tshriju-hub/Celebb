import React from 'react';

const BookingStats = ({ bookingCounts }) => {
  return (
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
  );
};

export default BookingStats; 