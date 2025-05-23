"use client";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Headphones, User } from 'lucide-react';
import {
  FaWhatsapp,
  FaStar,
  FaRegStar,
  FaHeart,
  FaReply,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaUtensils,
  FaPalette,
  FaMusic,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VenueMap from "@/components/googleMap/venueMap";

const MessageIcon = ({ venueId }) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/venues/${venueId}/chat`)}
      className="ml-4 p-4 rounded-full bg-white/20 backdrop-blur-sm shadow-md hover:bg-white/40 hover:scale-110 transition shadow-lg duration-200"
      title="Message this Venue"
    >
      <Image
        src="/customersupport.svg"
        alt="Customer Support"
        width={24}
        height={24}
        className="invert brightness-0" // This helps to make dark SVG white; tweak if needed
        priority
      />
    </button>
  );
};

export default function VenueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const { data: session } = useSession();
  const user = session?.user;
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState({});

  const LoginPromptModal = ({ visible, onClose }) => {
    if (!visible) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-[#7a1313]">
            Login Required
          </h2>
          <p className="mb-6 text-gray-600">
            You must be logged in to perform this action.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-[#7a1313] text-white px-4 py-2 rounded hover:bg-[#5a0e0e]"
          >
            Go to Login
          </button>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/registrations/${id}`
        );
        setVenue(response.data);
      } catch (error) {
        console.error("Error fetching venue details:", error);
        
        // Handle rate limiting error
        if (error.response && error.response.status === 429) {
          // Show a user-friendly error message
          alert("We're experiencing high traffic. Please try again in a few moments.");
          
          // Set a default venue to display while waiting
          setVenue({
            _id: id,
            name: "Venue Loading...",
            ownerName: "Please wait",
            capacity: "Loading",
            address: "Loading venue information",
            advancePayment: "Loading",
            hallImages: ["/Image/venues/venue1.png"]
          });
        }
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error(err);
        
        // Handle rate limiting error
        if (err.response && err.response.status === 429) {
          // Set empty reviews array
          setReviews([]);
        }
      }
    };

    fetchVenueDetails();
    fetchReviews();
  }, [id]);

  const handleBooking = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    } else {
      router.push(`/bookings?venueId=${id}`);
    }
  };
  

  const handleRatingClick = (star) => {
    setRating(star);
  };

  const handleSubmitReview = async () => {
    if (!user) return setShowLoginModal(true);
    if (!rating) {
      toast.error("Please select a rating", { position: "top-center" });
      return;
    }
    if (!comment) {
      toast.error("Please add a comment", { position: "top-center" });
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/reviews/${id}`,
        {
          userId: user.id || user._id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      toast.success("Review submitted successfully!", { position: "top-center" });
      setComment("");
      setRating(0);
      const updated = await axios.get(
        `http://localhost:5000/api/reviews/${id}`
      );
      setReviews(updated.data);
    } catch (err) {
      toast.error("Something went wrong!", { position: "top-center" });
    }
  };

  const handleLike = async (reviewId) => {
    if (!user) return setShowLoginModal(true);
    await axios.post(
      `http://localhost:5000/api/reviews/${id}/like`,
      { userId: user._id, reviewId },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    const updated = await axios.get(`http://localhost:5000/api/reviews/${id}`);
    setReviews(updated.data);
  };

  const handleReply = async (reviewId) => {
    if (!user) return setShowLoginModal(true);
    const text = replyText[reviewId];
    if (!text) {
      toast.error("Reply cannot be empty", { position: "top-center" });
      return;
    }

    try {
    await axios.post(
      `http://localhost:5000/api/reviews/${id}/reply`,
      {
        reviewId,
        userId: user.id || user._id,
        username: user.username || user.name || user.email.split("@")[0],
        reply: text,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
      toast.success("Reply added successfully!", { position: "top-center" });
    const updated = await axios.get(`http://localhost:5000/api/reviews/${id}`);
    setReviews(updated.data);
    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      setShowReplyInput((prev) => ({ ...prev, [reviewId]: false }));
    } catch (error) {
      toast.error("Failed to add reply", { position: "top-center" });
    }
  };

  const toggleReplyInput = (reviewId) => {
    setShowReplyInput((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const getImageName = (id) => {
    switch (id) {
      case "67cd515d292e3e57067f7bde":
        return "/Image/venues/venue1.png";
      case "67cd5313292e3e57067f7be2":
        return "/Image/venues/venue2.png";
      case "67df9976adbcc5dc8079c929":
        return "/Image/venues/venue3.png";
      default:
        return "/Image/venues/venue4.png";
    }
  };

  if (!venue) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7a1313]"></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50"
    >
      <LoginPromptModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
            {venue.hallImages && venue.hallImages.length > 0 ? (
              <>
                <img
                  src={venue.hallImages[currentImageIndex]}
                  alt={`Venue ${venue.name}`}
                  className="object-cover w-full h-full"
                />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Venue Name and Address - Positioned higher */}
            <div className="absolute top-1/4 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold mb-2">{venue.name}</h1>
                <MessageIcon venueId={venue._id} />
              </div>
              <p className="text-lg">{venue.address}</p>
            </div>

            {/* Back Button - Positioned higher */}
            <div className="absolute top-8 left-8">
              <Link
                href="/venues"
                className="inline-flex items-center text-white hover:text-gray-200 transition bg-black/30 px-4 py-2 rounded-lg"
              >
                <span className="mr-2">←</span> Back to Venues
              </Link>
            </div>

                {venue.hallImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {venue.hallImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No images available</p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Quick Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-[#7a1313]/10 p-3 rounded-full">
                <FaPhone className="text-[#7a1313] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{venue.phone || 'Phone number not available'}</p>
                  <a
                    href={`https://wa.me/${(venue.phone || '').replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-600"
                  >
                    <FaWhatsapp size={18} />
                  </a>
                </div>
                </div>
              </div>

            <div className="flex items-center space-x-3">
              <div className="bg-[#7a1313]/10 p-3 rounded-full">
                <FaCalendarAlt className="text-[#7a1313] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Established</p>
                <p className="font-medium">{venue.established}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-[#7a1313]/10 p-3 rounded-full">
                <FaUsers className="text-[#7a1313] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium">{venue.capacity} people</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-[#7a1313]/10 p-3 rounded-full">
                <FaBuilding className="text-[#7a1313] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of Halls</p>
                <p className="font-medium">{venue.numberOfHalls}</p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-8 border-b">
            <h2 className="text-2xl font-bold text-[#7a1313] mb-6">Pricing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-[#7a1313]/10 p-3 rounded-full">
                    <FaMoneyBillWave className="text-[#7a1313] text-xl" />
                  </div>
                  <h3 className="font-semibold">Advance Payment</h3>
                </div>
                <p className="text-2xl font-bold text-[#7a1313]">Rs{venue.advancePayment}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-[#7a1313]/10 p-3 rounded-full">
                    <FaUtensils className="text-[#7a1313] text-xl" />
                  </div>
                  <h3 className="font-semibold">Food Packages</h3>
                </div>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Silver</span>
                    <span className="font-semibold">Rs{venue.foodSilverPrice}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Gold</span>
                    <span className="font-semibold">Rs{venue.foodGoldPrice}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Diamond</span>
                    <span className="font-semibold">Rs{venue.foodDiamondPrice}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-[#7a1313]/10 p-3 rounded-full">
                    <FaPalette className="text-[#7a1313] text-xl" />
                  </div>
                  <h3 className="font-semibold">Additional Services</h3>
                </div>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Makeup</span>
                    <span className="font-semibold">Rs{venue.makeupPrice}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Decoration</span>
                    <span className="font-semibold">Rs{venue.decorationPrice}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Entertainment</span>
                    <span className="font-semibold">Rs{venue.entertainmentPrice}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-8 border-b">
            <h2 className="text-2xl font-bold text-[#7a1313] mb-6">Location</h2>
            <div className="h-96 rounded-xl overflow-hidden shadow-lg">
              <VenueMap venue={venue} />
            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#7a1313] mb-6">Reviews & Ratings</h2>
            
            {/* Review Form */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-gray-600">Your Rating:</span>
                <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none"
                  >
                    {star <= rating ? (
                        <FaStar className="text-3xl text-yellow-400 hover:text-yellow-500 transition-colors" />
                      ) : (
                        <FaRegStar className="text-3xl text-gray-400 hover:text-yellow-400 transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <span className="text-gray-600 ml-2">
                    ({rating} {rating === 1 ? 'star' : 'stars'})
                  </span>
                )}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mt-4 focus:ring-2 focus:ring-[#7a1313] focus:border-transparent"
                rows="3"
                placeholder="Share your experience with this venue..."
              ></textarea>
              <button
                onClick={handleSubmitReview}
                className="mt-4 px-6 py-2 bg-[#7a1313] text-white rounded-lg hover:bg-[#5a0e0e] transition flex items-center space-x-2"
              >
                <span>Submit Review</span>
                <FaStar className="text-yellow-400" />
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                  <p className="font-semibold">{rev.username}</p>
                        <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= rev.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-300" />
                        )}
                      </span>
                    ))}
                  </div>
                          <span className="text-sm text-gray-500">
                            ({rev.rating} {rev.rating === 1 ? 'star' : 'stars'})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(rev._id)}
                          className="text-red-500 hover:text-red-600 transition"
                    >
                      <FaHeart />
                    </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{rev.comment}</p>
                    
                    {/* Reply Section */}
                    <div className="space-y-3">
                      {/* Reply Button */}
                      <button
                        onClick={() => toggleReplyInput(rev._id)}
                        className="text-[#7a1313] hover:text-[#5a0e0e] transition flex items-center space-x-1"
                      >
                        <FaReply />
                        <span>Reply</span>
                      </button>

                      {/* Reply Input */}
                      {showReplyInput[rev._id] && (
                        <div className="mt-2">
                          <textarea
                      value={replyText[rev._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [rev._id]: e.target.value,
                        })
                      }
                            placeholder="Write your reply..."
                            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-transparent"
                            rows="2"
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => {
                                setShowReplyInput((prev) => ({ ...prev, [rev._id]: false }));
                                setReplyText((prev) => ({ ...prev, [rev._id]: "" }));
                              }}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                    <button
                      onClick={() => handleReply(rev._id)}
                              className="px-3 py-1 bg-[#7a1313] text-white rounded hover:bg-[#5a0e0e] transition"
                    >
                              Submit Reply
                    </button>
                  </div>
                        </div>
                      )}

                      {/* Existing Replies */}
                      {rev.replies && rev.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {rev.replies.map((r, idx) => (
                            <div key={idx} className="ml-6 pl-4 border-l-2 border-gray-200">
                              <p className="text-sm">
                                <span className="font-semibold text-[#7a1313]">{r.username}:</span>{" "}
                                {r.reply}
                        </p>
                      </div>
                    ))}
                </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Book Now Button */}
        <div className="fixed bottom-8 right-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#7a1313] text-white px-8 py-4 rounded-full shadow-lg hover:bg-[#5a0e0e] transition flex items-center space-x-2"
            onClick={handleBooking}
          >
            <span className="font-semibold">Book Now</span>
            <FaCalendarAlt />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

