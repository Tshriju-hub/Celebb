"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar.jsx";
import Confetti from "react-confetti";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { FaGift, FaHistory, FaCrown, FaChartLine, FaMedal, FaTrophy } from 'react-icons/fa';

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
  const [animateNumber, setAnimateNumber] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (animateNumber < loyaltyPoints) {
        setAnimateNumber(prev => Math.min(prev + 1, loyaltyPoints));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [loyaltyPoints]);

  const getLoyaltyTier = (points) => {
    if (points >= 1000) return { name: 'Diamond', icon: FaCrown, color: 'text-blue-500' };
    if (points >= 500) return { name: 'Platinum', icon: FaTrophy, color: 'text-purple-500' };
    if (points >= 200) return { name: 'Gold', icon: FaMedal, color: 'text-yellow-500' };
    return { name: 'Silver', icon: FaGift, color: 'text-gray-500' };
  };

  const tier = getLoyaltyTier(loyaltyPoints);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen bg-[#EBE4E4] text-gray-800">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7a1313] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EBE4E4] to-white text-gray-800">
      <Sidebar />
      <ToastContainer />
      {showConfetti && (
        <Confetti 
          width={window.innerWidth} 
          height={window.innerHeight}
          colors={['#7a1313', '#991c1c', '#FFD700', '#C0C0C0']}
        />
      )}

      <div className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-[#7a1313] flex items-center gap-3">
            <FaCrown className="text-yellow-500" />
            Loyalty Program
          </h1>
          <p className="text-gray-600 mb-8">Earn points and unlock exclusive rewards</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Points Card */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-[#7a1313] to-[#991c1c] p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Your Loyalty Points</h2>
                  <div className="flex items-center gap-2">
                    <tier.icon className={`${tier.color} text-xl`} />
                    <span>{tier.name} Tier</span>
                  </div>
                </div>
                <motion.div 
                  className="text-6xl font-bold"
                  key={loyaltyPoints}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  {animateNumber}
                </motion.div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col items-center">
                <button
                  className={`w-full py-4 rounded-2xl text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 ${
                    claimed
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#7a1313] hover:bg-[#991c1c] shadow-lg hover:shadow-xl"
                  }`}
                  onClick={handleClaim}
                  disabled={claimed}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaGift className="text-xl" />
                    {claimed ? "Already Claimed Today" : "Claim Daily Point"}
                  </div>
                </button>
                {claimed && (
                  <p className="text-sm text-gray-500 mt-3">
                    Next claim available in {24 - new Date().getHours()} hours
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            className="bg-white p-6 rounded-3xl shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaChartLine className="text-[#7a1313]" />
              Progress to Next Tier
            </h2>
            <div className="space-y-6">
              {[
                { name: 'Silver', threshold: 0, icon: FaGift },
                { name: 'Gold', threshold: 200, icon: FaMedal },
                { name: 'Platinum', threshold: 500, icon: FaTrophy },
                { name: 'Diamond', threshold: 1000, icon: FaCrown }
              ].map((tierLevel, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <tierLevel.icon className={`text-lg ${
                        loyaltyPoints >= tierLevel.threshold ? 'text-[#7a1313]' : 'text-gray-400'
                      }`} />
                      <span className={loyaltyPoints >= tierLevel.threshold ? 'font-semibold' : ''}>
                        {tierLevel.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{tierLevel.threshold} points</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#7a1313]"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (loyaltyPoints / tierLevel.threshold) * 100 || 0)}%`
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* History Section */}
        <motion.div
          className="mt-8 bg-white p-8 rounded-3xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FaHistory className="text-[#7a1313]" />
            Points History
          </h2>
          {loyaltyHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Date</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Activity</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyHistory.map((item, index) => (
                    <motion.tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="py-3 px-4">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${
                          item.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaGift className="text-4xl mx-auto mb-3 text-gray-400" />
              <p>No loyalty history yet. Start claiming your daily points!</p>
            </div>
          )}
        </motion.div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="bg-white p-8 rounded-3xl text-center shadow-2xl max-w-md w-full mx-4"
                initial={{ scale: 0.5, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 100 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  <FaCrown className="text-5xl text-yellow-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#7a1313] mb-2">
                  🎉 Congratulations!
                </h2>
                <p className="text-gray-600 mb-6">
                  You've earned a daily loyalty point!
                  <br />
                  Keep collecting to reach the next tier.
                </p>
                <button
                  className="w-full px-6 py-3 rounded-xl bg-[#7a1313] text-white hover:bg-[#991c1c] transition transform hover:scale-105"
                  onClick={() => setShowModal(false)}
                >
                  Continue
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
