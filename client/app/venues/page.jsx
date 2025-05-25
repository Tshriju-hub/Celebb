"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MainLayout from "@/components/layouts/mainLayout";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, Filter, MapPin, Tag } from "lucide-react";

export default function ViewVenues() {
  const [allVenues, setAllVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/registrations");
        setAllVenues(response.data);
        setFilteredVenues(response.data);
        
        // Extract unique categories and split them
        const allCategories = response.data.reduce((acc, venue) => {
          if (venue.category) {
            const venueCategories = venue.category.split(',').map(cat => cat.trim());
            return [...acc, ...venueCategories];
          }
          return acc;
        }, []);
        const uniqueCategories = [...new Set(allCategories)];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching venues:", error);

        if (error.response && error.response.status === 429) {
          alert("We're experiencing high traffic. Please try again in a few moments.");
          const placeholder = [
            {
              _id: "placeholder1",
              name: "Venue Loading...",
              ownerName: "Please wait",
              capacity: "Loading",
              address: "Loading venue information",
              advancePayment: "Loading",
              hallImages: ["/Image/venues/venue1.png"]
            },
            {
              _id: "placeholder2",
              name: "Venue Loading...",
              ownerName: "Please wait",
              capacity: "Loading",
              address: "Loading venue information",
              advancePayment: "Loading",
              hallImages: ["/Image/venues/venue2.png"]
            }
          ];
          setAllVenues(placeholder);
          setFilteredVenues(placeholder);
        }
      }
    };
    fetchVenues();
  }, []);

  const handleFilter = () => {
    const filtered = allVenues.filter((venue) => {
      const matchesLocation = locationFilter
        ? venue.address.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      const matchesPrice = priceFilter.min || priceFilter.max
        ? venue.advancePayment >= Number(priceFilter.min || 0) &&
          venue.advancePayment <= Number(priceFilter.max || Infinity)
        : true;
      const matchesSearch = search
        ? venue.name.toLowerCase().includes(search.toLowerCase()) ||
          venue.ownerName.toLowerCase().includes(search.toLowerCase())
        : true;
      
      // Check if venue has any of the selected categories
      const venueCategories = venue.category ? venue.category.split(',').map(cat => cat.trim()) : [];
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.some(cat => venueCategories.includes(cat));
      
      return matchesLocation && matchesPrice && matchesSearch && matchesCategories;
    });
    setFilteredVenues(filtered);
  };

  // Filter venues when categories change
  useEffect(() => {
    handleFilter();
  }, [selectedCategories]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleDetails = (id) => {
    router.push(`/venues/${id}`);
  };

  const MessageIcon = ({ onClick }) => (
    <button
      onClick={onClick}
      className="p-2 rounded-full bg-gradient-to-br from-[#7a1313] to-[#a33a3a] hover:scale-110 transition shadow-lg"
      title="Message this Venue"
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path
          d="M2 21l21-9-21-9v7l15 2-15 2v7z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#E9E0DC] px-4 sm:px-8 md:px-12 py-20 flex flex-col items-center">
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
          {/* Filter Box - Sticky */}
          <div className="lg:w-auto w-full max-w-[280px] bg-white rounded-2xl shadow-xl p-6 space-y-6 sticky top-24 h-fit">
            <div className="flex items-center gap-2 text-[#7a1313] text-xl font-semibold">
              <Filter className="w-6 h-6" /> Filters
            </div>

            {/* Category Filter Box */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Categories</label>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? 'bg-[#7a1313] text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border ${
                      selectedCategories.includes(category)
                        ? 'border-white bg-white'
                        : 'border-gray-400'
                    }`}>
                      {selectedCategories.includes(category) && (
                        <svg className="w-4 h-4 text-[#7a1313]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Enter location"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#7a1313] focus:border-[#7a1313]"
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={priceFilter.min}
                  onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#7a1313] focus:border-[#7a1313]"
                />
                <input
                  type="number"
                  value={priceFilter.max}
                  onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#7a1313] focus:border-[#7a1313]"
                />
              </div>
            </div>

            <button
              onClick={handleFilter}
              className="w-full bg-[#7a1313] text-white py-2 rounded-lg hover:bg-[#5a0e0e] transition-all duration-300"
            >
              Apply Filters
            </button>
          </div>

          {/* Right Side - Search & Scrollable Venue Cards */}
          <div className="lg:w-3/4 flex flex-col space-y-4">
            {/* Sticky Search */}
            <div className="sticky top-20 z-10 w-full flex justify-center bg-[#E9E0DC] pb-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFilter();
                }}
                className="flex flex-col sm:flex-row w-full max-w-4xl bg-white shadow-md rounded-xl px-4 py-2"
              >
                <div className="flex flex-1 items-center gap-2 bg-gray-100 rounded-xl px-3 py-1">
                  <Search className="text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                    placeholder="Search venue or owner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#7a1313] text-white px-4 py-2 text-sm rounded-xl hover:bg-[#5e0f0f] transition-all duration-300 mt-2 sm:mt-0 sm:ml-2"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Scrollable Cards */}
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-2 space-y-8 custom-scrollbar">
              {filteredVenues.length > 0 ? (
                filteredVenues.map((registration) => (
                  <div key={registration._id} className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8 md:w-2/3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900">{registration.name}</h2>
                        <div className="flex flex-wrap gap-2">
                          {registration.category?.split(',').map((cat, index) => (
                            <span key={index} className="px-3 py-1 bg-[#7a1313]/10 text-[#7a1313] rounded-full text-sm font-medium">
                              {cat.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mt-3 leading-relaxed text-sm sm:text-base">
                        <span className="font-medium">Owner Name:</span> {registration.ownerName} |
                        <span className="font-medium"> Capacity:</span> {registration.capacity} people |
                        <span className="font-medium"> Location:</span> {registration.address} |
                        <span className="font-medium"> Advance Payment:</span> Rs. {registration.advancePayment}
                      </p>

                      {/* Description */}
                      <p className="text-gray-600 mt-4 line-clamp-2">
                        {registration.description}
                      </p>

                      <div className="mt-6">
                        <button
                          onClick={() => handleDetails(registration._id)}
                          className="border border-gray-500 text-gray-700 px-6 py-2 rounded-xl text-sm sm:text-base hover:bg-gray-100 transition-all duration-300"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden group">
                      <img
                        src={registration.hallImages?.[0] || "/Image/venues/venue1.png"}
                        alt={registration.name}
                        className="object-cover w-full h-full clip-diagonal group-hover:scale-110 transition-transform duration-500 ease-in-out rounded-tr-2xl"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No venues found.</p>
              )}
            </div>
          </div>
        </div>

        <style jsx global>{`
          .clip-diagonal {
            clip-path: polygon(25% 0, 100% 0, 100% 100%, 0% 100%);
          }

          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
          }
        `}</style>
      </div>
    </MainLayout>
  );
}
