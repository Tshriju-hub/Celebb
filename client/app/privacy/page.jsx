'use client';

import React, { useState } from 'react';
import MainLayout from '/components/layouts/mainLayout';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserLock, FaDatabase, FaCookieBite, FaEnvelope, FaUserFriends, FaInfoCircle } from 'react-icons/fa';

export default function Privacy() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const sections = [
    {
      icon: <FaUserLock className="text-3xl" />,
      title: "Information We Collect",
      content: [
        "Personal identification information (Name, email address, phone number)",
        "Booking and transaction history",
        "Payment information (processed securely through our payment partners)",
        "Communication preferences and settings",
        "Device and usage information when accessing our platform"
      ]
    },
    {
      icon: <FaDatabase className="text-3xl" />,
      title: "How We Use Your Data",
      content: [
        "Process and manage your event bookings",
        "Communicate about your reservations and services",
        "Improve our platform and services",
        "Send relevant updates and promotional content",
        "Ensure platform security and prevent fraud"
      ]
    },
    {
      icon: <FaUserFriends className="text-3xl" />,
      title: "Information Sharing",
      content: [
        "Venue partners for booking fulfillment",
        "Service providers and vendors you select",
        "Payment processors for secure transactions",
        "Legal requirements and law enforcement",
        "With your explicit consent for other purposes"
      ]
    },
    {
      icon: <FaCookieBite className="text-3xl" />,
      title: "Cookies & Tracking",
      content: [
        "Essential cookies for platform functionality",
        "Analytics to improve user experience",
        "Preference cookies to remember your settings",
        "Marketing cookies for relevant content",
        "Third-party cookies from our partners"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      x: -50,
      opacity: 0,
      scale: 0.9
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.6
      }
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                  transition: { duration: 0.8 }
                }}
              >
                <FaShieldAlt className="text-7xl text-[#7a1313]" />
              </motion.div>
            </div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-[#7a1313] mb-4"
            >
              Privacy Policy
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base text-gray-600 max-w-2xl mx-auto"
            >
              Your privacy is important to us. Please read our privacy policy carefully.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: hoveredIndex === index ? 1.02 : 1,
                  boxShadow: hoveredIndex === index
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500 transform"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full"
                >
                  <div className="p-6 flex items-center justify-between cursor-pointer relative overflow-hidden">
                    <motion.div
                      animate={{
                        x: expandedIndex === index ? 0 : -10,
                        opacity: expandedIndex === index ? 0.1 : 0,
                      }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#7a1313] to-transparent"
                    />
                    <div className="flex items-center gap-4 relative z-10">
                      <motion.div
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 10,
                        }}
                        animate={{
                          color: expandedIndex === index ? '#7a1313' : '#666',
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10
                        }}
                        className="text-2xl"
                      >
                        {section.icon}
                      </motion.div>
                      <h2 className="text-lg font-semibold text-black">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                </button>
                <div className="px-4 pb-4 text-sm text-gray-500">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            className="mt-16 bg-gradient-to-r from-[#7a1313] to-[#9a1515] text-white p-8 rounded-xl text-center shadow-xl"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <FaEnvelope className="text-5xl mx-auto mb-4" />
              <h2 className="text-3xl font-semibold mb-4">Contact Us About Privacy</h2>
              <p className="mb-6 text-lg">
                If you have any questions about our privacy practices or would like to exercise your data rights, please contact our privacy team.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#fff" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="bg-white text-[#7a1313] px-10 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 text-lg shadow-md"
              >
                Contact Privacy Team
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center text-gray-600"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaInfoCircle className="text-xl" />
              <p className="text-lg font-semibold">Important Notice</p>
            </div>
            <p className="text-base">
              This privacy policy may be updated periodically to reflect changes in our data practices or legal requirements.
            </p>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 
