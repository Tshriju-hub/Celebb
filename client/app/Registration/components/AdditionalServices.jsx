import React from 'react';

const AdditionalServices = ({ formData, handleChange }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-6">
      <h3 className="text-xl font-semibold text-[#6D0C0E]">Additional Services Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Makeup Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="makeupPrice"
              type="number"
              placeholder="e.g., 5000"
              value={formData.makeupPrice}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Decoration Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="decorationPrice"
              type="number"
              placeholder="e.g., 15000"
              value={formData.decorationPrice}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Entertainment Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="entertainmentPrice"
              type="number"
              placeholder="e.g., 10000"
              value={formData.entertainmentPrice}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalServices; 