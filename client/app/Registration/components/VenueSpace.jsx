import React from 'react';

const VenueSpace = ({ formData, handleChange }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-6">
      <h3 className="text-xl font-semibold text-[#6D0C0E]">Venue Space & Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Space Preference <span className="text-red-500">*</span></label>
          <select
            name="spacePreference"
            value={formData.spacePreference}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          >
            <option value="">Select space preference</option>
            <option value="open">Open Hall</option>
            <option value="closed">Closed Hall</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Number of Halls <span className="text-red-500">*</span></label>
          <input
            name="numberOfHalls"
            type="number"
            placeholder="e.g., 3"
            value={formData.numberOfHalls}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Food Silver Package Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="foodSilverPrice"
              type="number"
              placeholder="e.g., 3000"
              value={formData.foodSilverPrice}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Food Gold Package Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="foodGoldPrice"
              type="number"
              placeholder="e.g., 5000"
              value={formData.foodGoldPrice}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Food Diamond Package Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="foodDiamondPrice"
              type="number"
              placeholder="e.g., 7000"
              value={formData.foodDiamondPrice}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueSpace; 