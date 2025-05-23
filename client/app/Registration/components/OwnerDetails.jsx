import React from 'react';

const OwnerDetails = ({ formData, handleChange }) => {
  return (
    <div className="bg-gray-50 p-8 rounded-xl">
      <h3 className="text-2xl font-semibold text-[#6D0C0E] mb-6">Owner Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Owner Name <span className="text-red-500">*</span></label>
          <input
            name="ownerName"
            placeholder="e.g., Shreeju Thapa"
            value={formData.ownerName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Owner Email <span className="text-red-500">*</span></label>
          <input
            name="ownerEmail"
            type="email"
            placeholder="e.g., ShreejuThapa@example.com"
            value={formData.ownerEmail}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Owner Phone Number <span className="text-red-500">*</span></label>
          <input
            name="ownerPhone"
            type="tel"
            placeholder="e.g., 9801234567"
            value={formData.ownerPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default OwnerDetails; 