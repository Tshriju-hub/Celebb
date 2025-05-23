"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {useSession} from "next-auth/react";
import axios from "axios";
import DatePickerWithValidation from './components/DatePickerWithValidation';

const UserBooking = () => {
  const [eventType, setEventType] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [totalGuests, setTotalGuests] = useState("");
  const [date, setDate] = useState("");
  const [hall, setHall] = useState([]);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const venueId = searchParams.get("venueId");
  const [catering, setCatering] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showLoyaltySection, setShowLoyaltySection] = useState(false);
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [venueDetails, setVenueDetails] = useState(null);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptWhatsApp, setAcceptWhatsApp] = useState(false);

  const [selectedMenuItems, setSelectedMenuItems] = useState({
    starters: {
      veg: { items: [] },
      nonVeg: { chicken: [], fish: [] }
    },
    mainCourse: {
      rice: { items: [] },
      rotiNaanNoodlesPasta: { items: [] },
      veg: { items: [] },
      vegetables: { items: [] },
      nonVeg: { mutton: [], chicken: [], fish: [] }
    },
    pickle: { veg: { items: [] }, fermented: { items: [] } },
    salads: { veg: { items: [] } },
    dessert: {
      sweets: { flourBased: [], milkBased: [] },
      dairy: { items: [] },
      ice: { items: [] }
    },
    beverages: {
      coldDrinks: { items: [] },
      teaCoffee: { items: [] },
      alcoholicDrinks: { beers: [], whiskey: [] }
    }
  });

  // Fetch loyalty points when session is available
  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      if (!session?.user?.token) {
        console.log('No session token available');
        return;
      }

      try {
        console.log('Fetching loyalty points with token:', session.user.token);
        const res = await axios.get("http://localhost:5000/api/loyalty/points", {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });
        
        console.log('Loyalty points response:', res.data);
        if (res.data && typeof res.data.points === 'number') {
          setLoyaltyPoints(res.data.points);
        } else {
          console.error('Invalid loyalty points data:', res.data);
        }
      } catch (err) {
        console.error('Error fetching loyalty points:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
        }
      }
    };

    if (session?.user?.token) {
      fetchLoyaltyPoints();
    }
  }, [session]);

  // Fetch venue details when venueId is available
  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (venueId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/auth/registrations/${venueId}`);
          setVenueDetails(response.data);
          setAdvancePayment(response.data.advancePayment || 0);
        } catch (error) {
          console.error("Error fetching venue details:", error);
        }
      }
    };

    fetchVenueDetails();
  }, [venueId]);

  // Update final price when points are redeemed
  useEffect(() => {
    setFinalPrice(advancePayment - pointsToRedeem);
  }, [advancePayment, pointsToRedeem]);

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

  const handleMenu = (e) => {
    const { id, checked } = e.target;
    
    if (id.startsWith("hall_")) {
      if (checked) {
        setHall([...hall, id]);
      } else {
        setHall(hall.filter((hallId) => hallId !== id));
      }
    } else if (id === "gold_package" || id === "silver_package" || id === "diamond_package") {
      if (checked) {
        setSelectedPackage(id);
        // Reset other package checkboxes and selected menu items
        const otherPackages = ["gold_package", "silver_package", "diamond_package"].filter(pkg => pkg !== id);
        otherPackages.forEach(pkg => {
          const checkbox = document.getElementById(pkg);
          if (checkbox) checkbox.checked = false;
        });
        setSelectedMenuItems({
          starters: {
            veg: { items: [] },
            nonVeg: { chicken: [], fish: [] }
          },
          mainCourse: {
            rice: { items: [] },
            rotiNaanNoodlesPasta: { items: [] },
            veg: { items: [] },
            vegetables: { items: [] },
            nonVeg: { mutton: [], chicken: [], fish: [] }
          },
          pickle: { veg: { items: [] }, fermented: { items: [] } },
          salads: { veg: { items: [] } },
          dessert: {
            sweets: { flourBased: [], milkBased: [] },
            dairy: { items: [] },
            ice: { items: [] }
          },
          beverages: {
            coldDrinks: { items: [] },
            teaCoffee: { items: [] },
            alcoholicDrinks: { beers: [], whiskey: [] }
          }
        });
      } else {
        setSelectedPackage("");
      }
    } else {
      // Handle menu item selection
      const parts = id.split("-");
      if (parts.length >= 2) {
        let section = parts[0];
        let category = parts[1];
        let subcategory = parts[2];
        let item = e.target.nextElementSibling.textContent.trim();

        setSelectedMenuItems(prev => {
          const newState = { ...prev };
          
          if (subcategory === "items") {
            // Handle items arrays
            if (!newState[section][category].items) {
              newState[section][category].items = [];
            }
            if (checked) {
              newState[section][category].items = [...newState[section][category].items, item];
            } else {
              newState[section][category].items = newState[section][category].items.filter(i => i !== item);
            }
          } else if (subcategory === "flourBased" || subcategory === "milkBased") {
            // Handle dessert sweets
            if (checked) {
              newState[section][category][subcategory] = [...newState[section][category][subcategory], item];
            } else {
              newState[section][category][subcategory] = newState[section][category][subcategory].filter(i => i !== item);
            }
          } else if (category === "nonVeg") {
            // Handle non-veg items
            if (!newState[section][category][subcategory]) {
              newState[section][category][subcategory] = [];
            }
            if (checked) {
              newState[section][category][subcategory] = [...newState[section][category][subcategory], item];
            } else {
              newState[section][category][subcategory] = newState[section][category][subcategory].filter(i => i !== item);
            }
          }
          
          return newState;
        });
      }
    }
  };

  // Menu items based on package
  const getMenuItems = () => {
    switch (selectedPackage) {
      case "silver_package":
        return {
          starters: {
            veg: {
              items: ["Paneer Pakoda", "Veg Spring Roll"],
            },
            nonVeg: {
              chicken: ["Chicken Pakoda", "Chicken Momo"],
              fish: ["Fish Finger"],
            },
          },
          mainCourse: {
            rice: {
              items: ["Plain Rice", "Jeera Rice"],
            },
            rotiNaanNoodlesPasta: {
              items: ["Butter Naan", "Plain Roti"],
            },
            veg: {
              items: ["Paneer Butter Masala", "Dal Makhani"],
            },
            vegetables: {
              items: ["Mix Vegetable", "Aloo Jeera"],
            },
            nonVeg: {
              mutton: ["Mutton Curry"],
              chicken: ["Chicken Curry", "Butter Chicken"],
              fish: ["Fish Curry"],
            },
          },
          pickle: {
            veg: {
              items: ["Tomato Pickle", "Green Chutney"],
            },
            fermented: {
              items: ["Mango Pickle"],
            },
          },
          salads: {
            veg: {
              items: ["Green Salad", "Russian Salad"],
            },
          },
          dessert: {
            sweets: {
              flourBased: ["Gulab Jamun"],
              milkBased: ["Rasmalai"],
            },
            dairy: {
              items: ["Juju Dhau"],
            },
            ice: {
              items: ["Vanilla Ice Cream"],
            },
          },
          beverages: {
            coldDrinks: {
              items: ["Coke/Fanta/Sprite"],
            },
            teaCoffee: {
              items: ["Tea", "Coffee"],
            },
            alcoholicDrinks: {
              beers: ["Mustang 330ml"],
              whiskey: [],
            },
          },
        };

      case "gold_package":
        return {
          starters: {
            veg: {
              items: ["Paneer Pakoda", "Veg Spring Roll", "Hara Bhara Kebab", "Veg Manchurian"],
            },
            nonVeg: {
              chicken: ["Chicken Pakoda", "Chicken Momo", "Chicken Tikka", "Chicken 65"],
              fish: ["Fish Finger", "Fish Tikka"],
            },
          },
          mainCourse: {
            rice: {
              items: ["Plain Rice", "Jeera Rice", "Pulao"],
            },
            rotiNaanNoodlesPasta: {
              items: ["Butter Naan", "Plain Roti", "Garlic Naan", "Butter Roti"],
            },
            veg: {
              items: ["Paneer Butter Masala", "Dal Makhani", "Paneer Tikka Masala", "Malai Kofta"],
            },
            vegetables: {
              items: ["Mix Vegetable", "Aloo Jeera", "Bhindi Masala", "Baingan Bharta"],
            },
            nonVeg: {
              mutton: ["Mutton Curry", "Mutton Rogan Josh"],
              chicken: ["Chicken Curry", "Butter Chicken", "Chicken Tikka Masala", "Chicken Do Pyaza"],
              fish: ["Fish Curry", "Fish Tikka Masala"],
            },
          },
          pickle: {
            veg: {
              items: ["Tomato Pickle", "Green Chutney", "Mint Chutney"],
            },
            fermented: {
              items: ["Mango Pickle", "Lemon Pickle"],
            },
          },
          salads: {
            veg: {
              items: ["Green Salad", "Russian Salad", "Caesar Salad"],
            },
          },
          dessert: {
            sweets: {
              flourBased: ["Gulab Jamun", "Rasgulla"],
              milkBased: ["Rasmalai", "Kheer"],
            },
            dairy: {
              items: ["Juju Dhau", "Lassi"],
            },
            ice: {
              items: ["Vanilla Ice Cream", "Chocolate Ice Cream"],
            },
          },
          beverages: {
            coldDrinks: {
              items: ["Coke/Fanta/Sprite", "Mineral Water"],
            },
            teaCoffee: {
              items: ["Tea", "Coffee", "Masala Chai"],
            },
            alcoholicDrinks: {
              beers: ["Mustang 330ml", "Arna 330ml"],
              whiskey: ["Nepal Ice"],
            },
          },
        };

      case "diamond_package":
        return {
          starters: {
            veg: {
              items: ["Paneer Pakoda", "Veg Spring Roll", "Hara Bhara Kebab", "Veg Manchurian", "Crispy Corn", "Veg Seekh Kebab"],
            },
            nonVeg: {
              chicken: ["Chicken Pakoda", "Chicken Momo", "Chicken Tikka", "Chicken 65", "Chicken Seekh Kebab", "Chicken Wings"],
              fish: ["Fish Finger", "Fish Tikka", "Fish Amritsari"],
            },
          },
          mainCourse: {
            rice: {
              items: ["Plain Rice", "Jeera Rice", "Pulao", "Biryani"],
            },
            rotiNaanNoodlesPasta: {
              items: ["Butter Naan", "Plain Roti", "Garlic Naan", "Butter Roti", "Laccha Paratha", "Cheese Naan"],
            },
            veg: {
              items: ["Paneer Butter Masala", "Dal Makhani", "Paneer Tikka Masala", "Malai Kofta", "Paneer Lababdar", "Shahi Paneer"],
            },
            vegetables: {
              items: ["Mix Vegetable", "Aloo Jeera", "Bhindi Masala", "Baingan Bharta", "Mushroom Masala", "Palak Paneer"],
            },
            nonVeg: {
              mutton: ["Mutton Curry", "Mutton Rogan Josh", "Mutton Keema"],
              chicken: ["Chicken Curry", "Butter Chicken", "Chicken Tikka Masala", "Chicken Do Pyaza", "Chicken Lababdar", "Chicken Kadhai"],
              fish: ["Fish Curry", "Fish Tikka Masala", "Fish Amritsari"],
            },
          },
          pickle: {
            veg: {
              items: ["Tomato Pickle", "Green Chutney", "Mint Chutney", "Coriander Chutney"],
            },
            fermented: {
              items: ["Mango Pickle", "Lemon Pickle", "Mixed Pickle"],
            },
          },
          salads: {
            veg: {
              items: ["Green Salad", "Russian Salad", "Caesar Salad", "Greek Salad"],
            },
          },
          dessert: {
            sweets: {
              flourBased: ["Gulab Jamun", "Rasgulla", "Jalebi", "Kaju Katli"],
              milkBased: ["Rasmalai", "Kheer", "Rabri"],
            },
            dairy: {
              items: ["Juju Dhau", "Lassi", "Sweet Lassi"],
            },
            ice: {
              items: ["Vanilla Ice Cream", "Chocolate Ice Cream", "Strawberry Ice Cream"],
            },
          },
          beverages: {
            coldDrinks: {
              items: ["Coke/Fanta/Sprite", "Mineral Water", "Fresh Juice"],
            },
            teaCoffee: {
              items: ["Tea", "Coffee", "Masala Chai", "Green Tea"],
            },
            alcoholicDrinks: {
              beers: ["Mustang 330ml", "Arna 330ml", "Tuborg"],
              whiskey: ["Nepal Ice", "Signature", "Royal Stag"],
            },
          },
          complementary: {
            items: [
              "Welcome Drink",
              "Complimentary Appetizers",
              "After Dinner Mints",
              "Complimentary Dessert Platter",
              "Complimentary Mocktail"
            ]
          }
        };

      default:
        return menu;
    }
  };

  // Update menu when package changes
  useEffect(() => {
    if (selectedPackage) {
      setMenu(getMenuItems());
    }
  }, [selectedPackage]);

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
    if (hall.length > 0 || catering) {
      setShowMenu(true);
    }
  };

  const handleContinueInfo = (e) => {
    e.preventDefault();
    setShowMenuInstructions(true);
  };

  const handleLoyaltyPoints = (e) => {
    e.preventDefault();
    setShowLoyaltySection(true);
  };

  const handleContinueUserDetails = (e) => {
    e.preventDefault();
    setShowUserDetails(true);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowTermsModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions to proceed");
      return;
    }

    try {
      setLoading(true);
      
      // Ensure we have a valid user ID
      if (!session?.user?.id) {
        toast.error("Please log in to make a booking");
        return;
      }

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.token}`
        },
        body: JSON.stringify({
          owner: session.user.id,
          venueId: venueId,
          eventType,
          eventTime,
          totalGuests,
          date,
          hall,
          catering,
          menu: selectedMenuItems, // Send only selected menu items
          menuInstructions,
          fullName,
          phone1,
          phone2,
          email,
          address,
          image,
          pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
          whatsappNotifications: acceptWhatsApp
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Show success toast with discount information if applicable
        const successMessage = data.discountApplied > 0 
          ? `Booking created successfully! You saved Rs${data.discountApplied} using your loyalty points.`
          : data.message;
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            window.location.href = '/venues';
          }
        });
      } else {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setError(data.errors || "An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
      setShowTermsModal(false);
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
                        className="block text-xl mb-1"
                      >
                        Date:
                      </label>
                      <DatePickerWithValidation
                        value={date}
                        onChange={setDate}
                        eventTime={eventTime}
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
  <>
    <div className="mt-5 mx-5 py-4 mb-5">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        {/* GOLD PACKAGE */}
        <div className="flex flex-col md:w-1/3 rounded-md shadow-md p-4">
          <img
            src="/Image/gold.jpg"
            alt="Gold Package"
            className="h-auto w-full rounded-md mb-3"
          />
          <h1 className="text-2xl  font-bold text-yellow-600">
            Gold Package
          </h1>
          <p className="text-sm  text-justify">
            Premium multi-course meal with desserts, drinks, and VIP service. Perfect for lavish celebrations.
          </p>
          <div className="flex items-center space-x-2 mt-5">
            <input
              type="checkbox"
              id="gold_package"
              className="form-checkbox h-5 w-5 text-yellow-500"
              onChange={handleMenu}
            />
            <label
              htmlFor="gold_package"
              className="text-sm sm:text-base "
            >
              Select Gold Package
            </label>
          </div>
        </div>

        {/* SILVER PACKAGE */}
        <div className="flex flex-col md:w-1/3 rounded-md shadow-md p-4">
          <img
            src="/Image/silver.jpg"
            alt="Silver Package"
            className="h-auto w-full rounded-md mb-3"
          />
          <h1 className="text-2xl  font-bold text-gray-500">
            Silver Package
          </h1>
          <p className="text-sm  text-justify">
            A well-balanced mix of traditional and modern dishes for medium-scale events and parties.
          </p>
          <div className="flex items-center space-x-2 mt-5">
            <input
              type="checkbox"
              id="silver_package"
              className="form-checkbox h-5 w-5 text-gray-400"
              onChange={handleMenu}
            />
            <label
              htmlFor="silver_package"
              className="text-sm sm:text-base "
            >
              Select Silver Package
            </label>
          </div>
        </div>

        {/* DIAMOND PACKAGE */}
        <div className="flex flex-col md:w-1/3 rounded-md shadow-md p-4">
          <img
            src="/Image/diamond.jpg"
            alt="Diamond Package"
            className="h-auto w-full rounded-md mb-3"
          />
          <h1 className="text-2xl  font-bold text-blue-800">
            Diamond Package
          </h1>
          <p className="text-sm  text-justify">
            Elite catering with gourmet dishes, exclusive drinks, and top-tier hospitality. For grand events.
          </p>
          <div className="flex items-center space-x-2 mt-5">
            <input
              type="checkbox"
              id="diamond_package"
              className="form-checkbox h-5 w-5 text-blue-700"
              onChange={handleMenu}
            />
            <label
              htmlFor="diamond_package"
              className="text-sm sm:text-base "
            >
              Select Diamond Package
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleContinueMenu}
          className="bg-black text-white rounded-md shadow-md py-2 px-10 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
        >
          <span className="text-xl ">Continue</span>
        </button>
      </div>
    </div>
  </>
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
                          <span className="text-xl font-semibold uppercase">
                            {selectedPackage === "silver_package" ? "Silver Package Menu" :
                             selectedPackage === "gold_package" ? "Gold Package Menu" :
                             selectedPackage === "diamond_package" ? "Diamond Package Menu" : "Menu"}
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
                              {/* Starters Section */}
                              <div className="w-1/2 ml-10 mt-10 flex flex-col text-white">
                                <h1 className="text-2xl font-bold text-red-900 underline uppercase mb-2">
                                  Veg Starters
                                </h1>
                                {menu.starters?.veg?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`starters-veg-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`starters-veg-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="w-full md:w-1/2 ml-4 mt-10 flex flex-col text-white mb-8">
                                <h1 className="text-2xl font-bold text-red-900 underline uppercase mb-2">
                                  Non-Veg Starters
                                </h1>
                                <h2 className="text-xl font-semibold text-red-900 uppercase mb-4">
                                  Chicken Starters
                                </h2>
                                {menu.starters?.nonVeg?.chicken.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`starters-nonVeg-chicken-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`starters-nonVeg-chicken-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}

                                <h2 className="text-xl font-semibold text-red-900 uppercase mb-4">
                                  Fish Starters
                                </h2>
                                {menu.starters?.nonVeg?.fish.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`starters-nonVeg-fish-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`starters-nonVeg-fish-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Main Course Section */}
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
                          <span className="text-xl font-semibold uppercase">
                            Main Course
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row">
                          <img
                            src="/Image/menu.jpg"
                            alt=""
                            className="w-full h-5/6 md:w-8/12"
                          />
                          <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow-auto">
                            <div className="flex flex-col md:flex-row text-white overflow-auto">
                              {/* Rice Section */}
                              <div className="w-full md:w-1/2 ml-14 mt-10 flex flex-col overflow-auto">
                                <h1 className="text-2xl font-bold text-red-900 underline uppercase mb-2">
                                  RICE
                                </h1>
                                {menu.mainCourse?.rice?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`mainCourse-rice-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`mainCourse-rice-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              {/* Veg Section */}
                              <div className="w-1/2 ml-14 mt-10">
                                <h1 className="text-2xl font-bold underline text-red-900 uppercase mb-2">
                                  Veg
                                </h1>
                                {menu.mainCourse?.veg?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`mainCourse-veg-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`mainCourse-veg-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Complementary Items for Diamond Package */}
                    {selectedPackage === "diamond_package" && (
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
                            <span className="text-xl font-semibold uppercase">
                              Complementary Items
                            </span>
                          </div>
                          <div className="flex flex-col md:flex-row">
                            <img
                              src="/Image/menu.jpg"
                              alt=""
                              className="w-full h-5/6 md:w-8/12"
                            />
                            <div className="w-full md:w-1/2 bg-gradient-to-tr to-amber-200 from-black overflow-auto">
                              <div className="w-full ml-14 mt-10 text-white">
                                {menu.complementary?.items.map((item, index) => (
                                  <div key={index} className="flex items-center mb-4">
                                    <span className="text-xl">• {item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Sweets Section */}
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
                          <span className="text-xl font-semibold uppercase">
                            Sweets & Desserts
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
                                <h1 className="text-2xl font-bold text-red-900 underline uppercase mb-2">
                                  Sweets
                                </h1>
                                <h2 className="text-xl font-semibold text-red-900 uppercase mb-2">
                                  Flour Based Sweets
                                </h2>
                                {menu.dessert?.sweets?.flourBased.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`dessert-sweets-flourBased-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`dessert-sweets-flourBased-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}

                                <h2 className="text-xl font-semibold text-red-900 uppercase mb-2">
                                  Milk Based Sweets
                                </h2>
                                {menu.dessert?.sweets?.milkBased.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`dessert-sweets-milkBased-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`dessert-sweets-milkBased-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="w-1/2 ml-4 mt-10 text-white">
                                <h1 className="text-xl font-semibold text-red-900 uppercase mb-2">
                                  Dairy
                                </h1>
                                {menu.dessert?.dairy?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`dessert-dairy-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`dessert-dairy-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}

                                <h1 className="text-xl font-semibold text-red-900 uppercase mb-2">
                                  Ice Cream
                                </h1>
                                {menu.dessert?.ice?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`dessert-ice-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`dessert-ice-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Beverages Section */}
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
                          <span className="text-xl font-semibold uppercase">
                            Beverages
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
                                <h1 className="text-2xl font-bold text-red-900 underline uppercase mb-4">
                                  Cold Drinks
                                </h1>
                                {menu.beverages?.coldDrinks?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`beverages-coldDrinks-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`beverages-coldDrinks-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="w-1/2 ml-4 mt-10 text-white">
                                <h2 className="text-xl font-semibold text-red-900 uppercase mb-4">
                                  Tea/Coffee
                                </h2>
                                {menu.beverages?.teaCoffee?.items.map((item, index) => (
                                  <div key={index} className="flex flex-row">
                                    <input
                                      type="checkbox"
                                      id={`beverages-teaCoffee-items-${item.replace(/\s+/g, '')}`}
                                      className="mr-1"
                                      onChange={handleMenu}
                                    />
                                    <label
                                      className="text-md"
                                      htmlFor={`beverages-teaCoffee-items-${item.replace(/\s+/g, '')}`}
                                    >
                                      {item}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-row mt-10">
                              <div className="w-full ml-14 text-white">
                                <h1 className="text-2xl font-bold text-red-900 underline uppercase mb-4">
                                  Alcoholic Drinks
                                </h1>
                                <div className="flex flex-col md:flex-row">
                                  <div className="w-1/2">
                                    <h2 className="text-xl font-semibold text-red-900 uppercase mb-2">
                                      Beers
                                    </h2>
                                    {menu.beverages?.alcoholicDrinks?.beers.map((item, index) => (
                                      <div key={index} className="flex flex-row">
                                        <input
                                          type="checkbox"
                                          id={`beverages-alcoholicDrinks-beers-${item.replace(/\s+/g, '')}`}
                                          className="mr-1"
                                          onChange={handleMenu}
                                        />
                                        <label
                                          className="text-md"
                                          htmlFor={`beverages-alcoholicDrinks-beers-${item.replace(/\s+/g, '')}`}
                                        >
                                          {item}
                                        </label>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="w-1/2">
                                    <h2 className="text-xl font-semibold text-red-900 uppercase mb-2">
                                      Whiskey
                                    </h2>
                                    {menu.beverages?.alcoholicDrinks?.whiskey.map((item, index) => (
                                      <div key={index} className="flex flex-row">
                                        <input
                                          type="checkbox"
                                          id={`beverages-alcoholicDrinks-whiskey-${item.replace(/\s+/g, '')}`}
                                          className="mr-1"
                                          onChange={handleMenu}
                                        />
                                        <label
                                          className="text-md"
                                          htmlFor={`beverages-alcoholicDrinks-whiskey-${item.replace(/\s+/g, '')}`}
                                        >
                                          {item}
                                        </label>
                                      </div>
                                    ))}
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

            {/* Menu Instructions Section */}
            <section>
              <div className="mx-14 mt-12 bg-white rounded-xl shadow-2xl mb-5">
                <h1 className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                  <div className="mt-1 mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="w-5 h-5"
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold uppercase">
                    Menu instruction
                  </span>
                </h1>
                {showMenuInstructions && (
                  <>
                    <div className="flex flex-col justify-center mx-10 py-10">
                      <div className="flex flex-col">
                        <label
                          htmlFor="menuInstructions"
                          className="text-xl text-gray-500"
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
                          onClick={handleLoyaltyPoints}
                          className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
                        >
                          <span className="text-xl">Continue</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Loyalty Points Section */}
            <section>
                <div className="mx-14 mt-12 bg-white rounded-xl shadow-2xl mb-5">
                  <h1 className="rounded-sm shadow-xl font-bold py-4 flex flex-row">
                    <div className="mt-1 mx-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="w-5 h-5"
                      >
                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold uppercase">
                      Payment & Loyalty Points
                    </span>
                    </h1>

            {showLoyaltySection && (
              
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Venue Advance Payment</h3>
                      <p className="text-2xl font-bold text-[#7a1313]">Rs{advancePayment}</p>
                    </div>

                    {loyaltyPoints >= 100 && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Loyalty Points Redemption</h3>
                        <div className="mb-4">
                          <p className="text-gray-600">Available Points: {loyaltyPoints}</p>
                          <p className="text-sm text-gray-500">Minimum 100 points required to redeem</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            min="100"
                            max={loyaltyPoints}
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                            className="border border-gray-300 rounded-md p-2 w-32"
                            placeholder="Points to redeem"
                          />
                          <p className="text-gray-600">
                            = Rs{pointsToRedeem} discount
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="border-t mt-6 pt-6">
                      <h3 className="text-lg font-semibold mb-2">Final Price After Discount</h3>
                      <p className="text-2xl font-bold text-[#7a1313]">Rs{finalPrice}</p>
                    </div>

                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleContinueUserDetails}
                        className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
                      >
                        <span className="text-xl">Continue</span>
                      </button>
                    </div>
                  </div>
                
            )}
            </div>
              </section>

            {/* Personal Details Section */}
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
              

                  <div className="rounded-md mt-2 mx-5 py-2 mb-2">
                    <h1 className="text-2xl font-bold  mb-4">
                      Please Enter Your Contact Details
                    </h1>
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
                    <div className="flex w-1/5 mx-4">
                      <button
                        onClick={handleSubmit}
                        className="bg-black text-white rounded-md shadow-md py-1 p-12 hover:scale-110 duration-300 transition-transform hover:bg-gradient-to-tr to-black from-red-600"
                      >
                        <span className="text-xl ">Book</span>
                      </button>
                    </div>
                  </div>
                
            )}
            </div>
              </section>
          </div>
        </form>
        <ToastContainer />
        {error && <div className="text-red-500">{error}</div>}
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-auto transform transition-all">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto mb-6">
                <div className="space-y-4 text-gray-600">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">1. Booking Confirmation</h3>
                    <p>Your booking is subject to availability and confirmation by the venue.</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">2. Payment Terms</h3>
                    <p>Advance payment is required to confirm your booking. The remaining balance must be paid as per the venue's policy.</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">3. Cancellation Policy</h3>
                    <p>Cancellations must be made at least 48 hours before the event. Refund policies vary based on the timing of cancellation.</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">4. Guest Count</h3>
                    <p>The final guest count must be confirmed 24 hours before the event. Additional charges may apply for extra guests.</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">5. Venue Rules</h3>
                    <p>All guests must adhere to the venue's rules and regulations. The venue reserves the right to terminate services for violations.</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">6. Liability</h3>
                    <p>The venue is not responsible for any personal belongings or valuables brought to the event.</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-2">7. Force Majeure</h3>
                    <p>The venue is not liable for any failure to perform due to circumstances beyond reasonable control.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-gray-700">
                    I have read and agree to the terms and conditions
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="whatsapp"
                    checked={acceptWhatsApp}
                    onChange={(e) => setAcceptWhatsApp(e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="whatsapp" className="text-gray-700">
                    I agree to receive booking updates via WhatsApp
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!acceptTerms}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    acceptTerms
                      ? "bg-black text-white hover:bg-gray-800 transform hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default UserBooking;
