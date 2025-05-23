import React from 'react';

const ReviewSubmit = ({ formData }) => {
  const formatPrice = (price) => {
    return price ? `Rs. ${price}` : 'Not set';
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl space-y-8">
      <h3 className="text-2xl font-semibold text-[#6D0C0E] mb-6">Review Your Information</h3>
      
      {/* Owner Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Owner Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{formData.ownerName}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{formData.ownerEmail}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{formData.ownerPhone}</p>
          </div>
        </div>
      </div>

      {/* Venue Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Venue Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Venue Name</p>
            <p className="font-medium">{formData.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium">{formData.address}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{formData.phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Established Year</p>
            <p className="font-medium">{formData.established}</p>
          </div>
          <div>
            <p className="text-gray-600">Categories</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {formData.categories.map((category, index) => (
                <span key={index} className="bg-[#6D0C0E] text-white px-3 py-1 rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-600">Description</p>
            <p className="font-medium">{formData.description}</p>
          </div>
        </div>
      </div>

      {/* Space and Capacity */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Space and Capacity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Space Preference</p>
            <p className="font-medium">{formData.spacePreference}</p>
          </div>
          <div>
            <p className="text-gray-600">Number of Halls</p>
            <p className="font-medium">{formData.numberOfHalls}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Capacity</p>
            <p className="font-medium">{formData.capacity} guests</p>
          </div>
          <div>
            <p className="text-gray-600">Advance Payment</p>
            <p className="font-medium">{formatPrice(formData.advancePayment)}</p>
          </div>
        </div>
      </div>

      {/* Food Packages */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Food Package Pricing</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Silver Package</p>
            <p className="font-medium">{formatPrice(formData.foodSilverPrice)}</p>
          </div>
          <div>
            <p className="text-gray-600">Gold Package</p>
            <p className="font-medium">{formatPrice(formData.foodGoldPrice)}</p>
          </div>
          <div>
            <p className="text-gray-600">Diamond Package</p>
            <p className="font-medium">{formatPrice(formData.foodDiamondPrice)}</p>
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Additional Services</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Makeup Service</p>
            <p className="font-medium">{formatPrice(formData.makeupPrice)}</p>
          </div>
          <div>
            <p className="text-gray-600">Decoration Service</p>
            <p className="font-medium">{formatPrice(formData.decorationPrice)}</p>
          </div>
          <div>
            <p className="text-gray-600">Entertainment Service</p>
            <p className="font-medium">{formatPrice(formData.entertainmentPrice)}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h4 className="text-xl font-semibold text-[#6D0C0E] mb-4">Uploaded Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Hall Images</p>
            <p className="font-medium">{formData.hallImages.length} images uploaded</p>
          </div>
          <div>
            <p className="text-gray-600">Company Registration</p>
            <p className="font-medium">{formData.companyRegistration.length} document(s) uploaded</p>
          </div>
          <div>
            <p className="text-gray-600">Owner Citizenship</p>
            <p className="font-medium">{formData.ownerCitizenship.length} document(s) uploaded</p>
          </div>
          <div>
            <p className="text-gray-600">QR Code</p>
            <p className="font-medium">{formData.qrCode.length} document(s) uploaded</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmit; 