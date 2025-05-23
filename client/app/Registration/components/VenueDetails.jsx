import React, { useState } from 'react';

const VenueDetails = ({ formData, handleChange }) => {
  const [categories, setCategories] = useState(formData.categories || []);
  const [newCategory, setNewCategory] = useState('');

  const predefinedCategories = [
    'Banquet Hall',
    'Restaurant',
    'Hotel',
    'Resort',
    'Wedding Venue',
    'Conference Center',
    'Garden Venue',
    'Rooftop Venue'
  ];

  const handleCategoryAdd = (category) => {
    if (category && !categories.includes(category)) {
      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);
      handleChange({ target: { name: 'categories', value: updatedCategories } });
      setNewCategory('');
    }
  };

  const handleCategoryRemove = (categoryToRemove) => {
    const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
    setCategories(updatedCategories);
    handleChange({ target: { name: 'categories', value: updatedCategories } });
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl">
      <h3 className="text-2xl font-semibold text-[#6D0C0E] mb-6">Venue Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Venue Name <span className="text-red-500">*</span></label>
          <input
            name="name"
            placeholder="e.g., Kathmandu Banquet"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Address <span className="text-red-500">*</span></label>
          <input
            name="address"
            placeholder="e.g., Thamel, Kathmandu"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Phone Number <span className="text-red-500">*</span></label>
          <input
            name="phone"
            type="tel"
            placeholder="e.g., 9801234567"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Year Established <span className="text-red-500">*</span></label>
          <input
            name="established"
            type="number"
            placeholder="e.g., 2015"
            value={formData.established}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Advance Payment (NPR) <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">NPR</span>
            <input
              name="advancePayment"
              type="number"
              placeholder="e.g., 50000"
              value={formData.advancePayment}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Capacity <span className="text-red-500">*</span></label>
          <input
            name="capacity"
            type="number"
            placeholder="e.g., 500"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-gray-700 font-medium">Description</label>
          <textarea
            name="description"
            placeholder="e.g., A beautiful venue with modern amenities..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
            rows="3"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="block text-gray-700 font-medium">Categories <span className="text-red-500">*</span></label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="bg-[#6D0C0E] text-white px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => handleCategoryRemove(category)}
                    className="hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
              >
                <option value="">Select a category</option>
                {predefinedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleCategoryAdd(newCategory)}
                className="bg-[#6D0C0E] text-white px-4 py-2 rounded-lg hover:bg-[#8D0C0E] transition-colors"
              >
                Add
              </button>
            </div>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Or type a custom category"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D0C0E] focus:border-transparent transition-all duration-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCategoryAdd(newCategory);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails; 