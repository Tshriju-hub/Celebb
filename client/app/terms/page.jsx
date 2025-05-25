'use client';

import React, { useState } from 'react';
import MainLayout from '/components/layouts/mainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGavel, FaUserShield, FaFileContract, FaCreditCard, FaUserTie, FaInfoCircle, FaChevronDown } from 'react-icons/fa';

export default function Terms() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const sections = [
    {
      icon: <FaUserShield />,
      title: "User Agreement",
      content: `By accessing and using Celebration Station's services, you agree to comply with and be bound by these terms and conditions. These terms apply to all visitors, users, and others who access or use our services.`
    },
    {
      icon: <FaFileContract />,
      title: "Booking and Reservations",
      content: `All bookings are subject to availability and confirmation. A booking is only confirmed upon receipt of the required deposit and written confirmation from Celebration Station. Deposits are non-refundable unless otherwise specified in our cancellation policy.`
    },
    {
      icon: <FaCreditCard />,
      title: "Payment Terms",
      content: `Payment methods accepted include credit cards, bank transfers, and approved payment plans. Full payment must be received according to the payment schedule outlined in your booking confirmation. Late payments may result in cancellation of services.`
    },
    {
      icon: <FaUserTie />,
      title: "Vendor Relations",
      content: `While we maintain high standards for our vendor partners, Celebration Station acts as a platform connecting users with venue providers and service vendors. We are not directly responsible for third-party services but will assist in resolving any issues that may arise.`
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ 
                  duration: 1.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 380,
                  transition: { duration: 0.3 }
                }}
                className="bg-gradient-to-br from-[#7a1313] to-[#9a1515] p-5 rounded-full shadow-lg relative"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#7a1313] to-[#9a1515] rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <FaGavel className="text-6xl text-white relative z-10" />
              </motion.div>
            </div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-[#7a1313] mb-4"
            >
              Terms and Conditions
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-base text-gray-600 max-w-2xl mx-auto"
            >
              Please read these terms carefully before using our services
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: hoveredIndex === index ? 1.02 : 1,
                    boxShadow: hoveredIndex === index 
                      ? "0 20px 25px -5px rgba(122, 19, 19, 0.1), 0 10px 10px -5px rgba(122, 19, 19, 0.04)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl overflow-hidden"
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
                      <motion.div
                        animate={{ 
                          rotate: expandedIndex === index ? 180 : 0,
                          scale: hoveredIndex === index ? 1.2 : 1,
                        }}
                        transition={{ 
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200
                        }}
                        className="relative z-10"
                      >
                        <motion.div
                          animate={{
                            opacity: hoveredIndex === index ? 1 : 0,
                            scale: hoveredIndex === index ? 1.5 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-[#7a1313] rounded-full blur-lg"
                        />
                        <FaChevronDown className="text-[#7a1313] text-2xl relative z-10" />
                      </motion.div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: "auto", 
                          opacity: 1,
                          transition: {
                            height: {
                              duration: 0.4,
                              type: "spring",
                              stiffness: 100,
                              damping: 20
                            },
                            opacity: {
                              duration: 0.3,
                              delay: 0.2
                            }
                          }
                        }}
                        exit={{ 
                          height: 0, 
                          opacity: 0,
                          transition: {
                            height: {
                              duration: 0.3
                            },
                            opacity: {
                              duration: 0.2
                            }
                          }
                        }}
                      >
                        <motion.div 
                          className="px-4 pb-4 text-sm text-gray-500">
                          {section.content}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-[#7a1313] to-[#9a1515] text-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaInfoCircle className="text-xl" />
                <p className="text-lg font-semibold">Important Notice</p>
              </div>
              <p className="text-base">
                These terms and conditions may be updated periodically to reflect changes in our services, legal requirements, or business practices.
              </p>
            </motion.div>
            <p className="text-gray-600 text-lg mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 
