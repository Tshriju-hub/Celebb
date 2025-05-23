import React from 'react';

const VenueDetails = ({ venue }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-10">
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
          <div>
            <p className="font-medium mb-2">Categories:</p>
            <div className="flex flex-wrap gap-2">
              {venue.category?.split(',').map((cat, index) => (
                <span key={index} className="bg-[#6D0C0E] text-white px-3 py-1 rounded-full text-sm">
                  {cat.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{venue.description}</p>
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
  );
};

export default VenueDetails; 