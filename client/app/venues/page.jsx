"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import MainLayout from "@/components/layouts/mainLayout";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, Filter, MapPin } from "lucide-react";

export default function ViewVenues() {
  const [allVenues, setAllVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/registrations");
        setAllVenues(response.data);
        setFilteredVenues(response.data);
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
      return matchesLocation && matchesPrice && matchesSearch;
    });
    setFilteredVenues(filtered);
  };

  const handleDetails = (id) => {
    router.push(`/venues/${id}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#E9E0DC] px-4 sm:px-8 md:px-12 py-20 flex flex-col items-center">
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">

          {/* Filter Box - Sticky */}
          <div className="lg:w-auto w-full max-w-[280px] bg-white rounded-2xl shadow-xl p-6 space-y-6 sticky top-24 h-fit">
            <div className="flex items-center gap-2 text-[#7a1313] text-xl font-semibold">
              <Filter className="w-6 h-6" /> Filters
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="flex items-center bg-[#F5F5F5] rounded-xl px-4 py-2">
                <MapPin className="text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  className="w-full bg-transparent border-none focus:outline-none text-gray-700 text-sm"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="e.g., Kathmandu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment (Rs)</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  className="w-full border rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a1313]"
                  placeholder="Min"
                  value={priceFilter.min}
                  onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                />
                <input
                  type="number"
                  className="w-full border rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a1313]"
                  placeholder="Max"
                  value={priceFilter.max}
                  onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleFilter}
              className="w-full bg-[#7a1313] text-white py-2 text-sm rounded-xl hover:bg-[#5e0f0f] transition-all duration-300"
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
                      <h2 className="text-2xl font-semibold text-gray-900">{registration.name}</h2>
                      <p className="text-gray-700 mt-3 leading-relaxed text-sm sm:text-base">
                        <span className="font-medium">Owner Name:</span> {registration.ownerName} |
                        <span className="font-medium"> Capacity:</span> {registration.capacity} people |
                        <span className="font-medium"> Location:</span> {registration.address} |
                        <span className="font-medium"> Advance Payment:</span> Rs. {registration.advancePayment}
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
