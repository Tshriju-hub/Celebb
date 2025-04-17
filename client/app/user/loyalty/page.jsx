"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar.jsx";
import Confetti from "react-confetti";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const themeColor = "#7a1313";
const bgColor = "#EBE4E4";

const LoyaltyPage = () => {
  const { data: session, status } = useSession();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch loyalty points when session is available
  const fetchLoyaltyPoints = async () => {
    try {
      setLoading(true);
      
      if (!session?.user?.token) {
        console.error('No token available');
        toast.error('Please log in again');
        setLoading(false);
        return;
      }

      // Use the correct endpoint for loyalty points
      const res = await axios.get("http://localhost:5000/api/loyalty/points", {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      
      // The response contains loyalty points data
      setLoyaltyPoints(res.data.points || 0);
      setClaimed(!res.data.canClaimDaily);
      
      // Fetch loyalty history
      const historyRes = await axios.get("http://localhost:5000/api/loyalty/history", {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      
      setLoyaltyHistory(historyRes.data.history || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching loyalty points:', err);
      setLoading(false);
      toast.error(err.response?.data?.message || "Failed to fetch loyalty information");
    }
  };

  // Claim daily point
  const handleClaim = async () => {
    try {
      if (!session?.user?.token) {
        console.error('No token available');
        toast.error('Please log in again');
        return;
      }

      // Use the correct endpoint for claiming daily points
      const res = await axios.post(
        "http://localhost:5000/api/loyalty/claim-daily",
        {},
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      setLoyaltyPoints(res.data.currentPoints);
      setClaimed(true);
      setShowConfetti(true);
      setShowModal(true);
      toast.success(res.data.message || "Point claimed!");
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Refresh loyalty points
      fetchLoyaltyPoints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error claiming points");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchLoyaltyPoints();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen bg-[#EBE4E4] text-gray-800">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#EBE4E4] text-gray-800">
      <Sidebar />
      <ToastContainer />
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#7a1313]">
          🎁 Loyalty Program
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Loyalty Points Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Your Loyalty Points</h2>
            <p className="text-5xl font-bold text-[#7a1313]">{loyaltyPoints}</p>
            <p className="text-gray-600 mt-2">
              {loyaltyPoints === 1 ? "1 point" : `${loyaltyPoints} points`}
            </p>

            <button
              className={`mt-6 px-6 py-3 rounded-xl text-white font-medium text-lg transition-all duration-300 ${
                claimed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7a1313] hover:bg-[#991c1c]"
              }`}
              onClick={handleClaim}
              disabled={claimed}
            >
              {claimed ? "Already Claimed Today" : "Claim 1 Point Today"}
            </button>
          </div>

          {/* How It Works Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-[#7a1313] mr-2">1.</span>
                <span>Claim your daily point to earn rewards</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7a1313] mr-2">2.</span>
                <span>Accumulate points over time</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7a1313] mr-2">3.</span>
                <span>Redeem points when booking a venue</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7a1313] mr-2">4.</span>
                <span>Each point is worth Rs1 off your booking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Loyalty History */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Loyalty History</h2>
          {loyaltyHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Action</th>
                    <th className="py-2 text-left">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyHistory.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">{item.description}</td>
                      <td className="py-2">
                        <span
                          className={
                            item.points > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No loyalty history yet. Start claiming your daily points!
            </p>
          )}
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="bg-white p-8 rounded-3xl text-center shadow-2xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-[#7a1313]">
                  🎉 Congratulations!
                </h2>
                <p className="mt-4 text-lg">
                  You've earned 1 daily loyalty point.
                </p>
                <button
                  className="mt-6 px-6 py-2 rounded-full bg-[#7a1313] text-white hover:bg-[#991c1c] transition"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyPage;
