"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {useSession} from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";

const UserBooking = () => {
  const [eventType, setEventType] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [totalGuests, setTotalGuests] = useState("");
  const [date, setDate] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const venueId = searchParams.get("venueId");
  const [catering, setCatering] = useState([]);
  const [menu, setMenu] = useState({
    starters: {
      veg: {
        items: [],
      },
      nonVeg: {
        chicken: [],
        fish: [],
      },
    },
    mainCourse: {
      rice: {
        items: [],
      },
      rotiNaanNoodlesPasta: {
        items: [],
      },
      veg: {
        items: [],
      },
      vegetables: {
        items: [],
      },
      nonVeg: {
        mutton: [],
        chicken: [],
        fish: [],
      },
    },
    pickle: {
      veg: {
        items: [],
      },
      fermented: {
        items: [],
      },
    },
    salads: {
      veg: {
        items: [],
      },
    },
    dessert: {
      sweets: {
        flourBased: [],
        milkBased: [],
      },
      dairy: {
        items: [],
      },
      ice: {
        items: [],
      },
    },
    beverages: {
      coldDrinks: {
        items: [],
      },
      teaCoffee: {
        items: [],
      },

      alcoholicDrinks: {
        beers: [],
        whiskey: [],
      },
    },
  });

  const [menuInstructions, setMenuInstructions] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [showSelectOptions, setShowSelectOptions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMenuInstructions, setShowMenuInstructions] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPointsRedemption, setShowPointsRedemption] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);
  const router = useRouter();

  // Add validation for venueId
  useEffect(() => {
    if (!venueId) {
      toast.error("No venue selected. Please select a venue first.");
      router.push("/venues");
    }
  }, [venueId, router]);

  const handleMenu = (e) => {
    const { id, checked } = e.target;
    const [category, subcategory, item, subItem] = id.split("-");

    setMenu((prevMenu) => {
      const currentSelection = prevMenu[category]?.[subcategory]?.[item];
      const updatedSelection = checked
        ? [
            ...(Array.isArray(currentSelection) ? currentSelection : []),
            subItem,
          ]
        : (Array.isArray(currentSelection) ? currentSelection : []).filter(
            (selectedItem) => selectedItem !== subItem
          );

      return {
        ...prevMenu,
        [category]: {
          ...prevMenu[category],
          [subcategory]: {
            ...prevMenu[category]?.[subcategory],
            [item]: updatedSelection,
          },
        },
      };
    });
  };

  useEffect(() => {
      const fetchRegistrations = async () => {
        try {
          const response = await axios.get("http://localhost:5000/api/auth/registrations");
          console.log("Fetched registrations:", response.data);
          setRegistrations(response.data);
        } catch (error) {
          console.error("Error fetching registrations:", error);
        }
      };
  
      fetchRegistrations();
    }, []);

  const handleContinueHalls = (e) => {
    e.preventDefault();
    if (eventType && eventTime && totalGuests && date) {
      setShowSelectOptions(true);
    } else {
      alert("Please fill in all the required fields.");
    }
  };

  const handleContinueMenu = (e) => {
    e.preventDefault();
    if (selectedPackage || catering) {
      setShowMenu(true);
    }
  };

  const handleContinueInfo = (e) => {
    e.preventDefault();
    setShowMenuInstructions(true);
  };

  const handleContinueUserDetails = (e) => {
    e.preventDefault();
    setShowUserDetails(false);
    setShowPointsRedemption(true);
  };

  const handleContinuePointsRedemption = (e) => {
    e.preventDefault();
    setShowPointsRedemption(false);
    // Don't show user details again, just proceed to submission
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    if (id.startsWith("package_")) {
      if (checked) {
        setSelectedPackage(id.replace("package_", ""));
      } else {
        setSelectedPackage("");
      }
    }
  };

  const handleCheckboxCatering = (e) => {
    const { id, checked } = e.target;
    if (id.startsWith("catering_")) {
      if (checked) {
        setCatering([...catering, id]);
      } else {
        setCatering(catering.filter((cateringId) => cateringId !== id));
      }
    }
  };

  // Fetch user's loyalty points and venue details
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) return;
      
      try {
        // Fetch loyalty points
        const pointsRes = await axios.get("http://localhost:5000/api/loyalty/points", {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });
        setLoyaltyPoints(pointsRes.data.points || 0);

        // Set a default advance payment if venue details can't be fetched
        setAdvancePayment(5000); // Default advance payment of Rs. 5000
      } catch (err) {
        console.error('Error fetching data:', err);
        // Set default values if API calls fail
        setLoyaltyPoints(0);
        setAdvancePayment(5000);
      }
    };

    if (session?.user?.token) {
      fetchData();
    }
  }, [session]);

  // Calculate discount when points to redeem changes
  useEffect(() => {
    if (pointsToRedeem >= 100) {
      setDiscountAmount(pointsToRedeem); // 1 point = Rs. 1
    } else {
      setDiscountAmount(0);
    }
  }, [pointsToRedeem]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!venueId) {
      toast.error("No venue selected. Please select a venue first.");
      router.push("/venues");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please login to make a booking");
      router.push("/login");
      return;
    }

    try {
      const bookingData = {
        venueId,
        eventType,
        eventTime,
        totalGuests,
        date,
        selectedPackage,
        catering,
        menu,
        advancePayment: 1000,
        pointsToRedeem: pointsToRedeem || 0,
        userId: session.user.id,
      };

      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Booking submitted successfully!");
        router.push("/venues");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error(
        error.response?.data?.message || 
        "Failed to submit booking. Please try again."
      );
    }
  };

  return (
    <>
      <div className="container mx-auto mt-20">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold bg-White text- italic">
            Celebration Station Online Booking System
          </h1>
        </div>
        <hr className="mb-2 w-1/2 flex justify-center mx-auto" />
      </div>
      <div className="h-auto mt-10 bg- ">
        <form onSubmit={handleSubmit}>
          <div>
            <div className="mx-14 mt-12 bg-white rounded-xl mb-5">
              <div className=" rounded-xl shadow-xl font-bold py-4 flex flex-row">
                <div className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-5 h-5"
                  >
                    <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                  </svg>
                </div>
                <span className="text-md font-bold  uppercase">
                  Booking Details
                </span>
              </div>
              <div className="rounded-md mt-2 mx-5 py-2 mb-2">
                <h1 className="text-2xl font-bold  mb-4">
                  Please Enter Your Details
                </h1>

                <div className="space-y-6 md:space-y-0 md:flex md:flex-row md:space-x-6">
                  <div className="w-full md:w-1/2">
                    <div className="mb-4">
                      <label
                        htmlFor="eventType"
                        className="block  text-xl mb-1"
                      >
                        Event Type:
                      </label>
                      <select
                        id="eventType"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                      >
                        <option value="">Select Event Type</option>
                        <option value="wedding">Wedding</option>
                        <option value="conference">Conference</option>
                        <option value="party">Party</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="eventTime"
                        className="block  text-xl mb-1"
                      >
                        Event Time:
                      </label>
                      <select
                        id="eventTime"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                      >
                        <option value="">Select Event Time</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="mb-4">
                      <label
                        htmlFor="totalGuests"
                        className="block  text-xl mb-1"
                      >
                        Total Guests:
                      </label>
                      <input
                        type="number"
                        id="totalGuests"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={totalGuests}
                        onChange={(e) => setTotalGuests(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="date"
                        className="block  text-xl mb-1"
                      >
                        Date:
                      </label>
                      <NepaliDatePicker
                        inputClassName="w-full"
                        id="date"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={date}
                        onChange={(e) => setDate(e)}
                        options={{ calenderLocale: "ne", valueLocale: "en" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mx-4">
                  <button
                    onClick={handleContinueHalls}
                    className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
                  >
                    <span className="text-xl ">Continue</span>
                  </button>
                </div>
              </div>
            </div>

            <div className=" mx-14 mt-12 bg-white rounded-xl mb-5">
              <div className=" rounded-xl shadow-xl font-bold py-4 flex flex-row">
                <div className="mx-2 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512 "
                    className="w-5 h-5"
                  >
                    <path d="M80 80V192c0 2.5 1.2 4.9 3.2 6.4l51.2 38.4c6.8 5.1 10.4 13.4 9.5 21.9L133.5 352H85.2l9.4-85L54.4 236.8C40.3 226.2 32 209.6 32 192V72c0-22.1 17.9-40 40-40H376c22.1 0 40 17.9 40 40V192c0 17.6-8.3 34.2-22.4 44.8L353.4 267l9.4 85H314.5l-10.4-93.3c-.9-8.4 2.7-16.8 9.5-21.9l51.2-38.4c2-1.5 3.2-3.9 3.2-6.4V80H304v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H192v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H80zm4.7 384H363.3l-16.6-32H101.2L84.7 464zm271.9-80c12 0 22.9 6.7 28.4 17.3l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H72.8C50.2 512 32 493.8 32 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C68.5 390.7 79.5 384 91.5 384h265zM208 288c-8.8 0-16-7.2-16-16V224c0-17.7 14.3-32 32-32s32 14.3 32 32v48c0 8.8-7.2 16-16 16H208z" />
                  </svg>
                </div>
                <span className="text-xl font-bold  uppercase">
                  Select Food Package
                </span>{" "}
              </div>

              {showSelectOptions && (
                <div className="rounded-md mt-2 mx-5 py-2 mb-2">
                  <h1 className="text-2xl font-bold mb-4">Select Package</h1>
                  <div className="p-4 gap-6 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 flex flex-col">
                      <div className="mb-4">
                        <label className="block mb-2">Select Package:</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="package_silver"
                              name="package"
                              value="silver"
                              checked={selectedPackage === "silver"}
                              onChange={handleCheckboxChange}
                              className="mr-2"
                            />
                            <label htmlFor="package_silver">Silver Package</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="package_golden"
                              name="package"
                              value="golden"
                              checked={selectedPackage === "golden"}
                              onChange={handleCheckboxChange}
                              className="mr-2"
                            />
                            <label htmlFor="package_golden">Golden Package</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="package_diamond"
                              name="package"
                              value="diamond"
                              checked={selectedPackage === "diamond"}
                              onChange={handleCheckboxChange}
                              className="mr-2"
                            />
                            <label htmlFor="package_diamond">Diamond Package</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col">
                      <div className="mb-4">
                        <label className="block mb-2">Catering Options:</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="catering_yes"
                              checked={catering.includes("catering_yes")}
                              onChange={handleCheckboxCatering}
                              className="mr-2"
                            />
                            <label htmlFor="catering_yes">Yes, I need catering</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="catering_no"
                              checked={catering.includes("catering_no")}
                              onChange={handleCheckboxCatering}
                              className="mr-2"
                            />
                            <label htmlFor="catering_no">No, I don't need catering</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleContinueMenu}
                      className="bg-[#7a1313] text-white px-6 py-2 rounded-md hover:bg-[#5a0f0f] transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className=" mx-14 mt-12 bg-white rounded-xl mb-5">
              <div className=" rounded-xl shadow-xl font-bold py-4 flex flex-row">
                <div className="mx-2 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512 "
                    className="w-5 h-5"
                  >
                    <path d="M80 80V192c0 2.5 1.2 4.9 3.2 6.4l51.2 38.4c6.8 5.1 10.4 13.4 9.5 21.9L133.5 352H85.2l9.4-85L54.4 236.8C40.3 226.2 32 209.6 32 192V72c0-22.1 17.9-40 40-40H376c22.1 0 40 17.9 40 40V192c0 17.6-8.3 34.2-22.4 44.8L353.4 267l9.4 85H314.5l-10.4-93.3c-.9-8.4 2.7-16.8 9.5-21.9l51.2-38.4c2-1.5 3.2-3.9 3.2-6.4V80H304v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H192v24c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H80zm4.7 384H363.3l-16.6-32H101.2L84.7 464zm271.9-80c12 0 22.9 6.7 28.4 17.3l26.5 51.2c3 5.8 4.6 12.2 4.6 18.7c0 22.5-18.2 40.8-40.8 40.8H72.8C50.2 512 32 493.8 32 471.2c0-6.5 1.6-12.9 4.6-18.7l26.5-51.2C68.5 390.7 79.5 384 91.5 384h265zM208 288c-8.8 0-16-7.2-16-16V224c0-17.7 14.3-32 32-32s32 14.3 32 32v48c0 8.8-7.2 16-16 16H208z" />
                  </svg>
                </div>
                <span className="text-xl font-bold  uppercase">
                  Select Food Package
                </span>{" "}
              </div>{showSelectOptions && (
  <>
    {/* Makeup, Entertainment, Decoration */}
    <div className="rounded-md mt-5 mx-5 py-4 mb-5">
      <h1 className="text-2xl font-bold  mb-3">Optional Add-ons</h1>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Makeup */}
        <div className="rounded-md border p-4 shadow-sm">
          <h2 className="text-xl  font-semibold mb-2">Makeup</h2>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-pink-500"
                value="Basic Makeup"
              />
              <span className=" text-sm">Basic Makeup</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-pink-500"
                value="Bridal Makeup"
              />
              <span className=" text-sm">Bridal Makeup</span>
            </label>
          </div>
        </div>

        {/* Entertainment */}
        <div className="rounded-md border p-4 shadow-sm">
          <h2 className="text-xl  font-semibold mb-2">Entertainment</h2>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-purple-500"
                value="Live Band"
              />
              <span className=" text-sm">Live Band</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-purple-500"
                value="DJ"
              />
              <span className=" text-sm">DJ</span>
            </label>
          </div>
        </div>

        {/* Decoration */}
        <div className="rounded-md border p-4 shadow-sm">
          <h2 className="text-xl  font-semibold mb-2">Decoration</h2>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-green-500"
                value="Basic Decor"
              />
              <span className=" text-sm">Basic Decor</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-green-500"
                value="Premium Decor"
              />
              <span className=" text-sm">Premium Decor</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* Continue Button */}
    <div className="mx-5 py-2">
      <button
        onClick={handleContinueMenu}
        className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
      >
        <span className="text-xl ">Continue</span>
      </button>
    </div>
  </>
)}
</div>

            {/* for menu list */}

            <div className="mx-14 mt-12 bg-white rounded-xl mb-5">
              <div className=" rounded-xl shadow-xl font-bold py-4 flex flex-row">
                <div className="mx-2 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512 "
                    className="w-5 h-5"
                  >
                    <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                  </svg>
                </div>
                <span className="text-xl font-bold uppercase">
                  Design Menu
                </span>
              </div>
              <div>
                {showMenu && (
                  <>
                    <section>
                      <div className="mx-10 mt-12 bg-white shadow-2xl rounded-sm">
                        <div className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                          <div className="mt-1 mx-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-5 h-5"
                            >
                              <path d="M0 192c0-35.3 28.7-64 64-64c.5 0 1.1 0 1.6 0C73 91.5 105.3 64 144 64c15 0 29 4.1 40.9 11.2C198.2 49.6 225.1 32 256 32s57.8 17.6 71.1 43.2C339 68.1 353 64 368 64c38.7 0 71 27.5 78.4 64c.5 0 1.1 0 1.6 0c35.3 0 64 28.7 64 64c0 11.7-3.1 22.6-8.6 32H8.6C3.1 214.6 0 203.7 0 192zm0 91.4C0 268.3 12.3 256 27.4 256H484.6c15.1 0 27.4 12.3 27.4 27.4c0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28H140.2c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z" />
                            </svg>
                          </div>
                          <span className="text-xl  font-semibold uppercase">
                            Starters
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-col md:flex-row">
                            <img
                              src="/Image/menu.jpg"
                              alt=""
                              className="w-full h-5/6 md:w-8/12"
                            />
                            <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black flex flex-col md:flex-row overflow-auto">
                              <div className="w-1/2 ml-10 mt-10 flex flex-col text-white">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-2">
                                  Veg Starters
                                </h1>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-paneerPakoda"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-paneerPakoda"
                                  >
                                    Paneer Pakoda
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-paneerChilli"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-paneerChilli"
                                  >
                                    Paneer Chilli
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-mixVegPakoda"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-mixVegPakoda"
                                  >
                                    Mix Veg Pakoda
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-onionPakoda"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-onionPakoda"
                                  >
                                    Onion Pakoda
                                  </label>
                                </div>

                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-aalooPakoda"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-aalooPakoda"
                                  >
                                    Aaloo Pakoda
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-aalooTikka"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-aalooTikka"
                                  >
                                    Aaloo Tikka
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-aalooSadheko"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-aalooSadheko"
                                  >
                                    Aaloo Sadheko
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-crispyAaloo"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-crispyAaloo"
                                  >
                                    Crispy Aaloo
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-aalooChill"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-aalooChill"
                                  >
                                    Aaloo Chill
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-thakaliAaloo"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-thakaliAaloo"
                                  >
                                    Thakali Aaloo
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-miniSamosa"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-miniSamosa"
                                  >
                                    Mini Samosa
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-cornChilli"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-cornChilli"
                                  >
                                    Corn Chilli
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-greenCornPotlli"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-greenCornPotlli"
                                  >
                                    Green Corn Potlli
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-vegTempura"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-vegTempura"
                                  >
                                    Veg Tempura
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-vegMomo"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-vegMomo"
                                  >
                                    Veg Mo:Mo
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-miniFriedIdli"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-miniFriedIdli"
                                  >
                                    Mini Fried Idli
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-frenchFries"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-frenchFries"
                                  >
                                    French Fries
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-crispyPaneer"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-crispyPaneer"
                                  >
                                    Crispy Paneer
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-paneerShashlik"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-paneerShashlik"
                                  >
                                    Paneer Shashlik
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-paneerSingaporean"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-paneerSingaporean"
                                  >
                                    Paneer Singaporean
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-mushroomChilli"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-mushroomChilli"
                                  >
                                    Mushroom Chilli
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-mushroomSaltPepper"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-mushroomSaltPepper"
                                  >
                                    Mushroom Salt & Pepper
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-mushroomChwela"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-mushroomChwela"
                                  >
                                    Mushroom Chwela
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-hariyaliKabab"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-hariyaliKabab"
                                  >
                                    Hariyali Kabab
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-vegLollypop"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-vegLollypop"
                                  >
                                    Veg Lollypop
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-moongDaalPakoda"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-moongDaalPakoda"
                                  >
                                    Moong Daal Pakoda
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-veg-items-maasDaalPakoda"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-veg-items-maasDaalPakoda"
                                  >
                                    Maas Daal Pakoda
                                  </label>
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 ml-4 mt-10 flex flex-col text-white mb-8">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-2">
                                  Non-Veg Starters
                                </h1>
                                <h2 className="text-xl  font-semibold text-red-900 uppercase mb-4">
                                  Chicken Starters
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenChilliBoneless"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenChilliBoneless"
                                  >
                                    Chicken Chilli Boneless
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenMomo"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenMomo"
                                  >
                                    Chicken Mo:Mo
                                  </label>
                                </div>

                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenBall"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenBall"
                                  >
                                    Chicken Ball
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenSadheko"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenSadheko"
                                  >
                                    Chicken Sadheko
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenShammikabab"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenShammikabab"
                                  >
                                    Chicken Shammikabab
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenBotikabab"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenBotikabab"
                                  >
                                    Chicken Botikabab
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenTikka"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenTikka"
                                  >
                                    Chicken Tikka
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenReshmiKabab"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenReshmiKabab"
                                  >
                                    Chicken Reshmi Kabab
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenBBQ"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenBBQ"
                                  >
                                    Chicken BBQ
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenDrumstick"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenDrumstick"
                                  >
                                    Chicken Drumstick
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenShashlik"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenShashlik"
                                  >
                                    Chicken Shashlik
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenSausage"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenSausage"
                                  >
                                    Chicken Sausage
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenWanton"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenWanton"
                                  >
                                    Chicken Wanton
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-miniChickenSpringRoll"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-miniChickenSpringRoll"
                                  >
                                    Mini Chicken Spring Roll
                                  </label>
                                </div>
                                <div className="flex flex-row mb-2">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-chicken-chickenNuggets"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-chicken-chickenNuggets"
                                  >
                                    Chicken Nuggets
                                  </label>
                                </div>

                                <h2 className="text-xl  font-semibold text-red-900 uppercase mb-4">
                                  Fish Starters
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-fish-fishFinger"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-fish-fishFinger"
                                  >
                                    Fish Finger
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-fish-fishChilli"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-fish-fishChilli"
                                  >
                                    Fish Chilli
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-fish-fishNuggets"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-fish-fishNuggets"
                                  >
                                    Fish Nuggets
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-fish-fishTempura"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-fish-fishTempura"
                                  >
                                    Fish Tempura
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-fish-fishShammiKabab"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-fish-fishShammiKabab"
                                  >
                                    Fish Shammi Kabab
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="starters-nonVeg-fish-fishFryMalekhuStyle"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="starters-nonVeg-fish-fishFryMalekhuStyle"
                                  >
                                    Fish Fry (Malekhu Style)
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="mx-10 mt-12 bg-white shadow-2xl rounded-sm">
                        <div className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                          <div className="mt-1 mx-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-5 h-5"
                            >
                              <path d="M0 192c0-35.3 28.7-64 64-64c.5 0 1.1 0 1.6 0C73 91.5 105.3 64 144 64c15 0 29 4.1 40.9 11.2C198.2 49.6 225.1 32 256 32s57.8 17.6 71.1 43.2C339 68.1 353 64 368 64c38.7 0 71 27.5 78.4 64c.5 0 1.1 0 1.6 0c35.3 0 64 28.7 64 64c0 11.7-3.1 22.6-8.6 32H8.6C3.1 214.6 0 203.7 0 192zm0 91.4C0 268.3 12.3 256 27.4 256H484.6c15.1 0 27.4 12.3 27.4 27.4c0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28H140.2c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold  uppercase">
                            Main Course
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row">
                          <img
                            src="/Image/menu.jpg"
                            alt=""
                            className="w-full h-5/6 md:w-8/12"
                          />
                          <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow:auto">
                            <div className="flex flex-col md:flex-row text-white overflow:auto">
                              <div className="w-full md:w-1/2 ml-14 mt-10 flex flex-col overflow:auto">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-2">
                                  RICE
                                </h1>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-plain_rice"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-plain_rice"
                                  >
                                    Plain Rice
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-butter_rice"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-butter_rice"
                                  >
                                    Butter Rice
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-plain_pulao"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-plain_pulao"
                                  >
                                    Plain Pulao
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-jeera_rice"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-jeera_rice"
                                  >
                                    Jeera Rice
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-saffron_rice"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-saffron_rice"
                                  >
                                    Saffron Rice
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-lemon_rice"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-lemon_rice"
                                  >
                                    Lemon Rice
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-veg_plain_rice"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-veg_plain_rice"
                                  >
                                    Vegetable Plain Rice
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rice-items-pulao_dry_fruits"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rice-items-pulao_dry_fruits"
                                  >
                                    Pulao with Dry Fruits
                                  </label>
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 ml-4 mt-10">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-2">
                                  ROTI/NAAN
                                </h1>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-plain_roti"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-plain_roti"
                                  >
                                    Plain Roti
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-tandoori_roti"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-tandoori_roti"
                                  >
                                    Tandoori Roti
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-plain_naan"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-plain_naan"
                                  >
                                    Plain Naan
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-butter_naan"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-butter_naan"
                                  >
                                    Butter Naan
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-stuffed_naan"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-stuffed_naan"
                                  >
                                    Stuffed Naan
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-garlic_naan"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-garlic_naan"
                                  >
                                    Garlic Naan
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-tandoori_roti_2"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-tandoori_roti_2"
                                  >
                                    Tandoori Roti
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-rotiNaanNoodlesPasta-items-missi_roti"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-rotiNaanNoodlesPasta-items-missi_roti"
                                  >
                                    Missi Roti
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row text-white">
                              <div className="w-1/2 ml-14 mt-10 ">
                                <h1 className="text-2xl  font-bold underline text-red-900 uppercase mb-2">
                                  Veg
                                </h1>
                                <h2 className="text-xl  font-semibold text-red-900 uppercase mb-6">
                                  DAAL/ LENTILS
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-daal_fry"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-daal_fry"
                                  >
                                    Daal Fry
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-daal_tadka"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-daal_tadka"
                                  >
                                    Daal Tadka
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-daal_makhani"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-daal_makhani"
                                  >
                                    Daal Makhani
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-palak_daal"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label htmlFor="mainCourse-veg-items-palak_daal">
                                    Palak Daal
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-mix_daal_fry"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-mix_daal_fry"
                                  >
                                    Mix Daal Fry
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-plain_yellow_daal"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-plain_yellow_daal"
                                  >
                                    Plain Yellow Daal
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-maas_ko_daal"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-maas_ko_daal"
                                  >
                                    Maas Ko Daal
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-rajma_masala"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-rajma_masala"
                                  >
                                    Rajma Masala
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-veg-items-chana_masala"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-veg-items-chana_masala"
                                  >
                                    Chana Masala
                                  </label>
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 ml-4 mt-10 overflow:auto">
                                <h1 className="text-2xl  font-bold underline text-red-900 uppercase mb-2">
                                  Vegetables
                                </h1>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-palak_paneer"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-palak_paneer"
                                  >
                                    Palak Paneer
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-shahi_paneer"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-shahi_paneer"
                                  >
                                    Shahi Paneer
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-paneer_bhujiya"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-paneer_bhujiya"
                                  >
                                    Paneer Bhujiya
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-mutter_paneer"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-mutter_paneer"
                                  >
                                    Mutter Paneer
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-kashmiri_kofta_kadhi"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-kashmiri_kofta_kadhi"
                                  >
                                    Kashmiri Kofta Kadhi
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-koftain_green_gravy"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-koftain_green_gravy"
                                  >
                                    Koftain Green Gravy
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-mutter_mushroom"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-mutter_mushroom"
                                  >
                                    Mutter Mushroom
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-palak_mushroom"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-palak_mushroom"
                                  >
                                    Palak Mushroom
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-seasonal_vegetable"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-seasonal_vegetable"
                                  >
                                    Seasonal Vegetable
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-mixed_vegetable"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-mixed_vegetable"
                                  >
                                    Mixed Vegetable
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-aaloo_dum"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-aloo_dum"
                                  >
                                    Aaloo Dum
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-aaloo_mutter"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-aaloo_mutter"
                                  >
                                    Aaloo Mutter
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-black_mushroom"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-black_mushroom"
                                  >
                                    Black Mushroom
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-vegetables-items-mixed_green_saag"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-vegetables-items-mixed_green_saag"
                                  >
                                    Mixed Green Saag
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row text-white">
                              <div className="w-full md:w-1/2 ml-14 mt-10">
                                <h1 className="text-2xl  font-bold underline text-red-400 uppercase mb-2">
                                  NON - Veg
                                </h1>
                                <h2 className="text-xl  text-red-400 font-semibold uppercase mb-4">
                                  MUTTON
                                </h2>

                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-mutton-mutton_korma"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-mutton-mutton_korma"
                                  >
                                    Mutton Korma
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-mutton-mutton_do_pyaza"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-mutton-mutton_do_pyaza"
                                  >
                                    Mutton do Pyaza
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-mutton-mutton_nepali"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-mutton-mutton_nepali"
                                  >
                                    Mutton Nepali
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-mutton-mutton_keema_curry"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-mutton-mutton_keema_curry"
                                  >
                                    Mutton Keema Curry
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-mutton-mutton_rogan_josh"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-mutton-mutton_rogan_josh"
                                  >
                                    Mutton Rogan Josh
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-mutton-mutton_kabab"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-mutton-mutton_kabab"
                                  >
                                    Mutton Kabab
                                  </label>
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 ml-4 mt-10">
                                <h2 className="text-xl  text-red-900 font-semibold uppercase mb-4">
                                  Chicken
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_fried"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_fried"
                                  >
                                    Chicken Fried
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_sesame"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_sesame"
                                  >
                                    Chicken Sesame
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_korma"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_korma"
                                  >
                                    Chicken Korma
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_pepper"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_pepper"
                                  >
                                    Chicken Pepper
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_tawa_tandoori"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_tawa_tandoori"
                                  >
                                    Chicken Tawa Tandoori
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_garlic"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_garlic"
                                  >
                                    Chicken Garlic
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_butter_masala"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_butter_masala"
                                  >
                                    Chicken Butter Masala
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="mainCourse-nonVeg-chicken-chicken_do_pyaza"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="mainCourse-nonVeg-chicken-chicken_do_pyaza"
                                  >
                                    Chicken do Pyaza
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="w-full md:w-1/2 ml-14 mt-10 mb-8 text-white">
                              <h2 className="text-xl  text-red-400 font-semibold uppercase mb-4">
                                Fish
                              </h2>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-fish_fried"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-fish_fried"
                                >
                                  Fish Fried
                                </label>
                              </div>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-tawa_fish"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-tawa_fish"
                                >
                                  Tawa Fish
                                </label>
                              </div>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-fish_tempura"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-fish_tempura"
                                >
                                  Fish Tempura
                                </label>
                              </div>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-fish_curry"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-fish_curry"
                                >
                                  Fish Curry
                                </label>
                              </div>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-garlic_fish"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-garlic_fish"
                                >
                                  Garlic Fish
                                </label>
                              </div>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-spicy_fish"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-spicy_fish"
                                >
                                  Spicy Fish
                                </label>
                              </div>
                              <div className="flex flex-row">
                                <input
                                  type="checkbox"
                                  id="mainCourse-nonVeg-fish-fresh_fish_bengali_gravy"
                                  className="mr-1"
                                  onChange={handleMenu}
                                />
                                <label
                                  className=" text-md"
                                  htmlFor="mainCourse-nonVeg-fish-fresh_fish_bengali_gravy"
                                >
                                  Fresh Fish Bengali Gravy
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="mx-10 mt-12 bg-white shadow-2xl rounded-sm">
                        <div className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                          <div className="mt-1 mx-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-5 h-5"
                            >
                              <path d="M0 192c0-35.3 28.7-64 64-64c.5 0 1.1 0 1.6 0C73 91.5 105.3 64 144 64c15 0 29 4.1 40.9 11.2C198.2 49.6 225.1 32 256 32s57.8 17.6 71.1 43.2C339 68.1 353 64 368 64c38.7 0 71 27.5 78.4 64c.5 0 1.1 0 1.6 0c35.3 0 64 28.7 64 64c0 11.7-3.1 22.6-8.6 32H8.6C3.1 214.6 0 203.7 0 192zm0 91.4C0 268.3 12.3 256 27.4 256H484.6c15.1 0 27.4 12.3 27.4 27.4c0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28H140.2c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold  uppercase">
                            Pickle
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-col md:flex-row">
                            <img
                              src="/Image/menu.jpg"
                              alt=""
                              className="w-full h-5/6 md:w-8/12"
                            />
                            <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow-auto">
                              <div className="flex flex-row">
                                <div className="w-1/2 ml-14 mt-10 text-white">
                                  <h1 className="text-2xl  font-bold underline text-red-900 uppercase mb-2">
                                    VEG
                                  </h1>
                                  <h2 className="text-xl  text-red-900 font-semibold uppercase mb-6">
                                    FRESH NEPALI ACHAR
                                  </h2>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-tomato_pickle"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-tomato_pickle"
                                    >
                                      Tomato Pickle
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-methi_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-methi_achar"
                                    >
                                      Methi Achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-aalu_capsicum_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-aalu_capsicum_achar"
                                    >
                                      Aalu Capsicum Achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-mula_kerau_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-mula_kerau_achar"
                                    >
                                      Mula Kerau Achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-alu_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-alu_achar"
                                    >
                                      Alu Achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-lapsi_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-lapsi_achar"
                                    >
                                      Lapsi Achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-koirala_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-koirala_achar"
                                    >
                                      Koirala Achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-veg-items-mango_chutney"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-veg-items-mango_chutney"
                                    >
                                      Mango Chutney
                                    </label>
                                  </div>
                                </div>
                                <div className="w-full md:w-1/2 ml-6 mt-10 text-white">
                                  <h1 className="text-2xl  font-bold underline text-red-900 uppercase mb-2">
                                    FERMENTED PICKLES
                                  </h1>
                                  <div className="flex flex-row mt-6">
                                    <input
                                      type="checkbox"
                                      id="pickle-fermented-items-gundruk_ko_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-fermented-items-gundruk_ko_achar"
                                    >
                                      gundruk ko achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-fermented-items-methi_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-fermented-items-methi_achar"
                                    >
                                      methi achar
                                    </label>
                                  </div>
                                  <div className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id="pickle-fermented-items-lapsi_ko_achar"
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className=" text-md"
                                      htmlFor="pickle-fermented-items-lapsi_ko_achar"
                                    >
                                      lapsi ko achar
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="mx-10 mt-12 bg-white shadow-2xl rounded-sm">
                        <div className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                          <div className="mt-1 mx-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-5 h-5"
                            >
                              <path d="M0 192c0-35.3 28.7-64 64-64c.5 0 1.1 0 1.6 0C73 91.5 105.3 64 144 64c15 0 29 4.1 40.9 11.2C198.2 49.6 225.1 32 256 32s57.8 17.6 71.1 43.2C339 68.1 353 64 368 64c38.7 0 71 27.5 78.4 64c.5 0 1.1 0 1.6 0c35.3 0 64 28.7 64 64c0 11.7-3.1 22.6-8.6 32H8.6C3.1 214.6 0 203.7 0 192zm0 91.4C0 268.3 12.3 256 27.4 256H484.6c15.1 0 27.4 12.3 27.4 27.4c0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28H140.2c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold  uppercase">
                            Salad
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-col md:flex-row">
                            <img
                              src="/Image/menu.jpg"
                              alt=""
                              className="w-full h-5/6 md:w-8/12"
                            />
                            <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow:auto">
                              <div className="w-1/2 ml-14 mt-10 text-white">
                                <h2 className="text-2xl  font-bold text-red-900 underline uppercase mb-6">
                                  VEG SALAD
                                </h2>
                                <div className=" flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="salads-veg-items-greenSalad"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="salads-veg-items-greenSalad"
                                  >
                                    Green Salad
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="salads-veg-items-russianSalad"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="salads-veg-items-russianSalad"
                                  >
                                    Russian Salad
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="salads-veg-items-sproutedSalad"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="salads-veg-items-sproutedSalad"
                                  >
                                    Sprouted Salad
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="salads-veg-items-cucumberSalad"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="salads-veg-items-cucumberSalad"
                                  >
                                    Cucumber Salad
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="salads-veg-items-cabbageSalad"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="salads-veg-items-cabbageSalad"
                                  >
                                    Cabbage Salad
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="salads-veg-items-greenPapayaSalad"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="salads-veg-items-greenPapayaSalad"
                                  >
                                    Green Papaya Salad
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="mx-10 mt-12 bg-white shadow-2xl rounded-sm">
                        <div className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                          <div className="mt-1 mx-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-5 h-5"
                            >
                              <path d="M0 192c0-35.3 28.7-64 64-64c.5 0 1.1 0 1.6 0C73 91.5 105.3 64 144 64c15 0 29 4.1 40.9 11.2C198.2 49.6 225.1 32 256 32s57.8 17.6 71.1 43.2C339 68.1 353 64 368 64c38.7 0 71 27.5 78.4 64c.5 0 1.1 0 1.6 0c35.3 0 64 28.7 64 64c0 11.7-3.1 22.6-8.6 32H8.6C3.1 214.6 0 203.7 0 192zm0 91.4C0 268.3 12.3 256 27.4 256H484.6c15.1 0 27.4 12.3 27.4 27.4c0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28H140.2c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold  uppercase">
                            Dessert
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row">
                          <img
                            src="/Image/menu.jpg"
                            alt=""
                            className="w-full h-5/6 md:w-8/12"
                          />
                          <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow-auto">
                            <div className="flex flex-row">
                              <div className="w-1/2 ml-14 mt-10 text-white">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-2">
                                  Sweets
                                </h1>
                                <h2 className="text-xl  font-semibold text-red-900 uppercase mb-2">
                                  Flour Based Sweets
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-flourBased-lalMohan"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-flourBased-lalMohan"
                                  >
                                    Lal Mohan
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-flourBased-jalebi"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-flourBased-jalebi"
                                  >
                                    Jalebi
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-flourBased-kalaJamun"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-flourBased-kalaJamun"
                                  >
                                    Kala Jamun
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-flourBased-rasmali"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-flourBased-rasmali"
                                  >
                                    Rasmalai
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-flourBased-gajar"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-flourBased-gajar"
                                  >
                                    Gajar Halwa
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-flourBased-mungDal"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-flourBased-mungDal"
                                  >
                                    Mung Dal Halwa
                                  </label>
                                </div>
                              </div>
                              <div className="w-1/2 ml-4 mt-20 text-white">
                                <h2 className="text-xl  text-red-900 font-semibold uppercase mb-8">
                                  Milk Based Sweets
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-milkBased-rasbari"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-milkBased-rasbari"
                                  >
                                    Rasbari
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-sweets-milkBased-barfi"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-sweets-milkBased-barfi"
                                  >
                                    Barfi
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row">
                              <div className="w-1/2 ml-14 mt-10 text-white">
                                <h1 className="text-xl  font-semibold text-red-400 uppercase mb-2">
                                  Curd
                                </h1>

                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-dairy-items-jujuDhau"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-dairy-items-jujuDhau"
                                  >
                                    Juju Dhau
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-dairy-items-dahi"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-dairy-items-dahi"
                                  >
                                    Dahi
                                  </label>
                                </div>
                              </div>
                              <div className="w-1/2 ml-4 mt-10 text-white">
                                <h1 className="text-xl  text-red-900 font-semibold uppercase mb-2">
                                  Ice-cream
                                </h1>

                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-ice-items-iceCream"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-ice-items-iceCream"
                                  >
                                    Ice Cream
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="dessert-ice-items-fruitCream"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="dessert-ice-items-fruitCream"
                                  >
                                    Fruit Cream
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="mx-10 mt-12 bg-white shadow-2xl rounded-sm">
                        <div className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                          <div className="mt-1 mx-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-5 h-5"
                            >
                              <path d="M0 192c0-35.3 28.7-64 64-64c.5 0 1.1 0 1.6 0C73 91.5 105.3 64 144 64c15 0 29 4.1 40.9 11.2C198.2 49.6 225.1 32 256 32s57.8 17.6 71.1 43.2C339 68.1 353 64 368 64c38.7 0 71 27.5 78.4 64c.5 0 1.1 0 1.6 0c35.3 0 64 28.7 64 64c0 11.7-3.1 22.6-8.6 32H8.6C3.1 214.6 0 203.7 0 192zm0 91.4C0 268.3 12.3 256 27.4 256H484.6c15.1 0 27.4 12.3 27.4 27.4c0 70.5-44.4 130.7-106.7 154.1L403.5 452c-2 16-15.6 28-31.8 28H140.2c-16.1 0-29.8-12-31.8-28l-1.8-14.4C44.4 414.1 0 353.9 0 283.4z" />
                            </svg>
                          </div>
                          <span className="text-xl font-semibold  uppercase">
                            Beverage
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row">
                          <img
                            src="/Image/menu.jpg"
                            alt=""
                            className="w-full h-5/6 md:w-8/12"
                          />
                          <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow-auto">
                            <div className="flex flex-row">
                              <div className="w-1/2 ml-14 mt-10">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-4">
                                  Cold Drinks
                                </h1>
                                <div className="fex flex-row">
                                  <input
                                    type="checkbox"
                                    id="beverages-coldDrinks-items-coke"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="beverages-coldDrinks-items-coke"
                                  >
                                    Coke/Fanta/Sprite
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="beverages-coldDrinks-items-pepsi"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="beverages-coldDrinks-items-pepsi"
                                  >
                                    Pepsi/Mirinda
                                  </label>
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 ml-4 mt-10">
                                <h2 className="text-xl  text-red-900 font-semibold uppercase mb-5">
                                  Tea/Coffee
                                </h2>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="beverages-teaCoffee-items-tea"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="beverages-teaCoffee-items-tea"
                                  >
                                    Tea
                                  </label>
                                </div>
                                <div className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id="beverages-teaCoffee-items-coffee"
                                    className="mr-1"
                                    onChange={handleMenu}
                                  />
                                  <label
                                    className=" text-md"
                                    htmlFor="beverages-teaCoffee-items-coffee"
                                  >
                                    Coffee
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row mt-10">
                              <div className="w-full ml-14">
                                <h1 className="text-2xl  font-bold text-red-900 underline uppercase mb-4">
                                  ALCOHOLIC DRINKS
                                </h1>

                                <div className="flex flex-col md:flex-row">
                                  <div className="w-1/2 text-white">
                                    <h2 className="text-xl  text-red-900 font-semibold uppercase mb-2">
                                      Beers
                                    </h2>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-mustang"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-mustang"
                                      >
                                        Mustang 330ml
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-arna"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-arna"
                                      >
                                        Arna 330ml
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-gorkha"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-gorkha"
                                      >
                                        Gorkha
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-nepal_ice"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-nepal_ice"
                                      >
                                        Nepal Ice
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-tuborg"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-tuborg"
                                      >
                                        Tuborg
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-barasinghe"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-barasinghe"
                                      >
                                        Barasinghe
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-beers-budweiser"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-beers-budweiser"
                                      >
                                        Budweiser
                                      </label>
                                    </div>
                                  </div>

                                  <div className="w-1/2 ml-4 text-white">
                                    <h2 className="text-xl  text-red-900 font-semibold uppercase mb-2">
                                      Whiskey
                                    </h2>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-whiskey-od"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-whiskey-od"
                                      >
                                        OD
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-whiskey-red_level"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-whiskey-red_level"
                                      >
                                        Red Level
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-whiskey-vodka"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-whiskey-vodka"
                                      >
                                        Vodka
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-whiskey-signature"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-whiskey-signature"
                                      >
                                        Signature
                                      </label>
                                    </div>
                                    <div className="flex flex-row">
                                      <input
                                        type="checkbox"
                                        id="beverages-alcoholicDrinks-whiskey-black_oak"
                                        className="mr-1"
                                        onChange={handleMenu}
                                      />
                                      <label
                                        className=" text-md"
                                        htmlFor="beverages-alcoholicDrinks-whiskey-black_oak"
                                      >
                                        Black Oak
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="mt-4 py-2 mx-10">
                      <button
                        onClick={handleContinueInfo}
                        className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
                      >
                        <span className="text-xl ">Continue</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <section>
              <div className="mx-14 mt-12 bg-white rounded-xl shadow-2xl mb-5">
                <h1 className=" rounded-sm shadow-xl font-bold py-4 flex flex-row">
                  <div className="mt-1 mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="w-5 h-5"
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                    </svg>
                  </div>
                  <span className="text-xl  font-bold uppercase">
                    Menu instruction
                  </span>
                </h1>
                {showMenuInstructions && (
                  <>
                    <div className="flex flex-col justify-center mx-10 py-10">
                      <div className="flex flex-col">
                        <label
                          htmlFor="menuInstructions"
                          className="text-xl  text-gray-500"
                        >
                          Please mention if you have any specific menu
                          instructions
                        </label>
                        <textarea
                          id="menuInstructions"
                          name="menuInstructions"
                          rows="2"
                          className="border w-full h-72 rounded-md resize-none"
                          value={menuInstructions}
                          onChange={(e) => setMenuInstructions(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handleContinueUserDetails}
                          className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
                        >
                          <span className="text-xl ">Continue</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section>
              <div className="mx-14 mt-12 bg-white rounded-xl mb-5">
                <div className=" rounded-xl shadow-xl font-bold py-4 flex flex-row">
                  <div className="mt-1 mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512 "
                      className="w-5 h-5"
                    >
                      <path d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
                    </svg>
                  </div>
                  <span className="text-xl  font-bold uppercase">
                    Booking Person Details
                  </span>
                </div>

                {showUserDetails && (
                  <>
                    <div className="rounded-md mt-2 mx-5 py-2 mb-2">
                      <h1 className="text-2xl font-bold mb-4">
                        Please Enter Your Contact Details
                      </h1>
                      
                      {/* Points Redemption Section */}
                      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-[#7a1313]">Loyalty Points Redemption</h2>
                          <div className="flex items-center space-x-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={showPointsRedemption}
                                onChange={(e) => setShowPointsRedemption(e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7a1313]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1313]"></div>
                              <span className="ml-3 text-sm font-medium text-gray-700">Use Points</span>
                            </label>
                          </div>
                        </div>

                        {showPointsRedemption && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 mb-2">Your Available Points</p>
                                <p className="text-2xl font-bold text-[#7a1313]">{loyaltyPoints}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 mb-2">Advance Payment</p>
                                <p className="text-2xl font-bold text-[#7a1313]">Rs. {advancePayment}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Points to Redeem (Minimum 100)
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="100"
                                  max={Math.min(loyaltyPoints, advancePayment)}
                                  value={pointsToRedeem}
                                  onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                                  className="border border-gray-300 rounded-md p-2 w-32"
                                  placeholder="Min. 100"
                                />
                                <span className="text-sm text-gray-500">points</span>
                              </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Discount Amount:</span>
                                <span className="text-xl font-bold text-green-600">Rs. {discountAmount}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-600">Final Payment:</span>
                                <span className="text-xl font-bold text-[#7a1313]">Rs. {advancePayment - discountAmount}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-500">
                              * 1 point = Rs. 1. You can redeem up to {Math.min(loyaltyPoints, advancePayment)} points.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 gap-6 flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 flex flex-col">
                          <div className="mb-4">
                            <label
                              htmlFor="full name"
                              className="block "
                            >
                              Full Name :
                            </label>
                            <input
                              id="name"
                              type="name"
                              className="border border-gray-300 rounded-md p-2 w-full"
                              placeholder="Please Enter Full Name"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="number"
                              className="block "
                            >
                              Phone:
                            </label>
                            <input
                              id="number"
                              type="number"
                              className="border border-gray-300 rounded-md p-2 w-full"
                              placeholder="Please Enter Number"
                              required
                              value={phone1}
                              onChange={(e) => setPhone1(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="number"
                              className="block "
                            >
                              Phone 2 Type :
                            </label>
                            <input
                              id="number"
                              type="number"
                              className="border border-gray-300 rounded-md p-2 w-full"
                              placeholder="WhatsApp or Viber number"
                              required
                              value={phone2}
                              onChange={(e) => setPhone2(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col">
                          <div className="mb-4">
                            <label htmlFor="email" className="block ">
                              Email :
                            </label>
                            <input
                              type="email"
                              id="email"
                              className="border border-gray-300 rounded-md p-2 w-full"
                              placeholder="Please Enter Your Email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label
                              htmlFor="address"
                              className="block "
                            >
                              Address :
                            </label>
                            <input
                              type="address"
                              id="address"
                              className="border border-gray-300 rounded-md p-2 w-full"
                              placeholder="Please Enter Your Address"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleContinueUserDetails}
                          className="bg-[#7a1313] text-white px-6 py-2 rounded-md hover:bg-[#5a0f0f] transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {showPointsRedemption && (
              <div className="rounded-md mt-2 mx-5 py-2 mb-2">
                <h1 className="text-2xl font-bold mb-4">Loyalty Points Redemption</h1>
                
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 mb-2">Your Available Points</p>
                      <p className="text-2xl font-bold text-[#7a1313]">{loyaltyPoints}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 mb-2">Advance Payment Required</p>
                      <p className="text-2xl font-bold text-[#7a1313]">Rs. {advancePayment}</p>
                    </div>
                  </div>

                  {loyaltyPoints >= 100 ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Points to Redeem (Minimum 100)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="100"
                            max={Math.min(loyaltyPoints, advancePayment)}
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                            className="border border-gray-300 rounded-md p-2 w-32"
                            placeholder="Min. 100"
                          />
                          <span className="text-sm text-gray-500">points</span>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Discount Amount:</span>
                          <span className="text-xl font-bold text-green-600">Rs. {discountAmount}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Final Payment:</span>
                          <span className="text-xl font-bold text-[#7a1313]">Rs. {advancePayment - discountAmount}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        * 1 point = Rs. 1. You can redeem up to {Math.min(loyaltyPoints, advancePayment)} points.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">You need at least 100 points to redeem for a discount.</p>
                      <p className="text-sm text-gray-500 mt-2">Current points: {loyaltyPoints}</p>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSubmit}
                      className="bg-[#7a1313] text-white px-6 py-2 rounded-md hover:bg-[#5a0f0f] transition-colors"
                    >
                      Submit Booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        <ToastContainer />
        {error && <div className="text-red-500">{error}</div>}
      </div>
      </>
  );
};
export default UserBooking;
