"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar.jsx";
import Confetti from "react-confetti";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { FaGift, FaHistory, FaCrown, FaChartLine, FaMedal, FaTrophy, FaFire, FaCalendarAlt, FaCoins, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const themeColor = "#7a1313";
const bgColor = "#EBE4E4";

// Tier thresholds and rewards
const TIERS = {
  SILVER: { threshold: 0, points: 50, streak: 1 },
  GOLD: { threshold: 200, points: 75, streak: 3 },
  PLATINUM: { threshold: 500, points: 100, streak: 7 },
  DIAMOND: { threshold: 1000, points: 150, streak: 14 }
};

const LoyaltyPage = () => {
  const { data: session, status } = useSession();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateNumber, setAnimateNumber] = useState(0);
  const [streak, setStreak] = useState(0);
  const [nextClaimTime, setNextClaimTime] = useState(null);
  const [dailyBonus, setDailyBonus] = useState(50);
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const [showCheckInAnimation, setShowCheckInAnimation] = useState(false);

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

      const res = await axios.get("http://localhost:5000/api/loyalty/points", {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });
      
      setLoyaltyPoints(res.data.points || 0);
      setClaimed(!res.data.canClaimDaily);
      setStreak(res.data.streak || 0);
      
      // Calculate next claim time
      if (res.data.lastClaimed) {
        const lastClaimed = new Date(res.data.lastClaimed);
        const nextClaim = new Date(lastClaimed);
        nextClaim.setDate(nextClaim.getDate() + 1);
        setNextClaimTime(nextClaim);
      }

      // Calculate daily bonus based on streak
      const bonus = calculateDailyBonus(res.data.streak || 0);
      setDailyBonus(bonus);
      
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

  const calculateDailyBonus = (currentStreak) => {
    if (currentStreak >= TIERS.DIAMOND.streak) return TIERS.DIAMOND.points;
    if (currentStreak >= TIERS.PLATINUM.streak) return TIERS.PLATINUM.points;
    if (currentStreak >= TIERS.GOLD.streak) return TIERS.GOLD.points;
    return TIERS.SILVER.points;
  };

  // Claim daily point
  const handleClaim = async () => {
    try {
      if (!session?.user?.token) {
        console.error('No token available');
        toast.error('Please log in again');
        return;
      }

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
      toast.success(res.data.message || "Points claimed!");
      setTimeout(() => setShowConfetti(false), 5000);
      
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
    if (points >= TIERS.DIAMOND.threshold) return { name: 'Diamond', icon: FaCrown, color: 'text-blue-500', points: TIERS.DIAMOND.points };
    if (points >= TIERS.PLATINUM.threshold) return { name: 'Platinum', icon: FaTrophy, color: 'text-purple-500', points: TIERS.PLATINUM.points };
    if (points >= TIERS.GOLD.threshold) return { name: 'Gold', icon: FaMedal, color: 'text-yellow-500', points: TIERS.GOLD.points };
    return { name: 'Silver', icon: FaGift, color: 'text-gray-500', points: TIERS.SILVER.points };
  };

  const tier = getLoyaltyTier(loyaltyPoints);

  const renderStreakBar = () => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return {
        day: i + 1,
        date: date,
        isCompleted: streak > i,
        isToday: i === 6
      };
    });

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaFire className="text-orange-500" />
            <span className="font-semibold">7-Day Streak Progress</span>
          </div>
          <button
            className="text-gray-500 hover:text-[#7a1313] transition-colors"
            onClick={() => setShowStreakInfo(!showStreakInfo)}
            data-tooltip-id="streak-info"
          >
            <FaInfoCircle className="text-xl" />
          </button>
          <Tooltip
            id="streak-info"
            place="bottom"
            className="max-w-xs"
            content={
              <div className="p-2">
                <h3 className="font-semibold mb-2">How Streaks Work</h3>
                <ul className="text-sm space-y-1">
                  <li>• Check in daily to maintain your streak</li>
                  <li>• Earn bonus points for consecutive days</li>
                  <li>• Streak resets if you miss a day</li>
                  <li>• Higher streaks unlock better rewards</li>
                </ul>
              </div>
            }
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          {days.map((day, index) => (
            <motion.div
              key={index}
              className={`relative flex flex-col items-center ${
                day.isToday ? 'scale-110' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                  day.isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    : day.isToday
                    ? 'bg-gradient-to-br from-[#7a1313] to-[#991c1c] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day.isCompleted ? (
                  <FaCheck className="text-xl" />
                ) : (
                  <FaCoins className="text-xl" />
                )}
              </div>
              <span className="text-sm font-medium">Day {day.day}</span>
              {day.isToday && (
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaCoins className="text-yellow-500" />
            <span className="font-medium">Total Points Earned: {loyaltyPoints}</span>
          </div>
          <button
            className={`px-6 py-2 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 ${
              claimed
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#7a1313] hover:bg-[#991c1c] shadow-lg hover:shadow-xl'
            }`}
            onClick={handleClaim}
            disabled={claimed}
          >
            <div className="flex items-center gap-2">
              <FaGift className="text-xl" />
              {claimed ? 'Already Checked In' : 'Check In'}
            </div>
          </button>
        </div>

        {/* Check-in Animation */}
        <AnimatePresence>
          {showCheckInAnimation && (
            <motion.div
              className="fixed inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-500 text-2xl"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut"
                  }}
                >
                  <FaCoins />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
              {renderStreakBar()}
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
              {Object.entries(TIERS).map(([key, tierLevel]) => (
                <div key={key} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {key === 'DIAMOND' && <FaCrown className="text-blue-500" />}
                      {key === 'PLATINUM' && <FaTrophy className="text-purple-500" />}
                      {key === 'GOLD' && <FaMedal className="text-yellow-500" />}
                      {key === 'SILVER' && <FaGift className="text-gray-500" />}
                      <span className={loyaltyPoints >= tierLevel.threshold ? 'font-semibold' : ''}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{tierLevel.threshold} points</span>
                      <FaCoins className="text-yellow-500" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#7a1313] to-[#991c1c]"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (loyaltyPoints / tierLevel.threshold) * 100 || 0)}%`
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Daily Bonus: +{tierLevel.points} points
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
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Streak</th>
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
                      <td className="py-3 px-4">
                        {item.action === 'daily_claim' && (
                          <div className="flex items-center gap-1">
                            <FaFire className="text-orange-500" />
                            <span>{item.streak || 1} days</span>
                          </div>
                        )}
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
                <p className="text-gray-600 mb-4">
                  You've earned {dailyBonus} daily loyalty points!
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <FaFire className="text-orange-500" />
                  <span className="font-semibold">Current Streak: {streak} days</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Keep collecting to reach the next tier and earn more points!
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
