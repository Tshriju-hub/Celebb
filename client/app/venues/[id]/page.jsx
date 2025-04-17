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
import {
  FaWhatsapp,
  FaStar,
  FaRegStar,
  FaHeart,
  FaReply,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  

  const handleSubmitReview = async () => {
    if (!user) return setShowLoginModal(true);
    if (!comment)
      return toast.error("Please add a comment.", { position: "top-center" });

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
    if (!text)
      return toast.error("Reply cannot be empty", { position: "top-center" });
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
    const updated = await axios.get(`http://localhost:5000/api/reviews/${id}`);
    setReviews(updated.data);
    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
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

  if (!venue) return <div className="text-center py-20">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen py-6 px-4 sm:px-8 lg:px-16"
    >
      <LoginPromptModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <Link
        href="/venues"
        className="text-[#7a1313] hover:text-white transition px-4 py-2 inline-block text-sm"
      >
        &larr; Back to Venues
      </Link>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-64">
            {venue.hallImages && venue.hallImages.length > 0 ? (
              <>
                <img
                  src={venue.hallImages[currentImageIndex]}
                  alt={`Venue ${venue.name}`}
                  className="object-cover w-full h-full"
                />
                {venue.hallImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {venue.hallImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {venue.hallImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? venue.hallImages.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === venue.hallImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                    >
                      →
                    </button>
                  </>
                )}
              </>
            ) : (
              <img
                src="/Image/venues/venue1.png"
                alt={`Venue ${venue.name}`}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-extrabold text-[#7a1313]">
              {venue.name}
            </h1>
            <p className="text-gray-500 text-sm">{venue.address}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h2 className="text-md font-semibold text-[#7a1313]">Phone</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-600 text-sm">{venue.phone}</p>
                  <a
                    href={`https://wa.me/${venue.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-600"
                  >
                    <FaWhatsapp size={18} />
                  </a>
                </div>
              </div>

              <div>
                <h2 className="text-md font-semibold text-[#7a1313]">
                  Established
                </h2>
                <p className="text-gray-600 text-sm">{venue.established}</p>
              </div>
              <div>
                <h2 className="text-md font-semibold text-[#7a1313]">
                  Capacity
                </h2>
                <p className="text-gray-600 text-sm">{venue.capacity} people</p>
              </div>
              <div>
                <h2 className="text-md font-semibold text-[#7a1313]">
                  Number of Halls
                </h2>
                <p className="text-gray-600 text-sm">{venue.numberOfHalls}</p>
              </div>
            </div>
            <div>
              <h2 className="text-md font-semibold text-[#7a1313] mb-2">
                Pricing
              </h2>
              <ul className="text-gray-600 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                <li>Advance Payment: Rs{venue.advancePayment}</li>
                <li>Food Silver: Rs{venue.foodSilverPrice}</li>
                <li>Food Gold: Rs{venue.foodGoldPrice}</li>
                <li>Food Diamond: Rs{venue.foodDiamondPrice}</li>
                <li>Makeup: Rs{venue.makeupPrice}</li>
                <li>Decoration: Rs{venue.decorationPrice}</li>
                <li>Entertainment: Rs{venue.entertainmentPrice}</li>
              </ul>
            </div>
            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 w-full bg-[#7a1313] text-white py-3 rounded-lg hover:bg-[#5a0e0e]"
                onClick={handleBooking}
              >
                Book Now
              </motion.button>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#7a1313]">
                Leave a Review
              </h2>
              <div className="flex space-x-1 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className="cursor-pointer"
                  >
                    {star <= rating ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-400" />
                    )}
                  </span>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                rows="3"
                placeholder="Write your comment..."
              ></textarea>
              <button
                onClick={handleSubmitReview}
                className="mt-2 px-4 py-2 bg-[#7a1313] text-white rounded-lg"
              >
                Submit Review
              </button>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#7a1313]">Reviews</h2>
              {reviews.map((rev) => (
                <div key={rev._id} className="border-b py-4">
                  <p className="font-semibold">{rev.username}</p>
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
                  <p className="text-gray-700">{rev.comment}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleLike(rev._id)}
                      className="text-red-500"
                    >
                      <FaHeart />
                    </button>
                    <input
                      value={replyText[rev._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [rev._id]: e.target.value,
                        })
                      }
                      placeholder="Write reply"
                      className="border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleReply(rev._id)}
                      className="text-blue-500"
                    >
                      <FaReply />
                    </button>
                  </div>
                  {rev.replies &&
                    rev.replies.map((r, idx) => (
                      <div key={idx} className="ml-6 mt-2 border-l pl-4">
                        <p className="text-sm text-gray-600">
                          <strong>{r.username}:</strong> {r.reply}
                        </p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
