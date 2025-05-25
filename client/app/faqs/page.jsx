'use client';

import React, { useState } from 'react';
import MainLayout from '/components/layouts/mainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQuestionCircle, 
  FaCalendarAlt, 
  FaCreditCard, 
  FaBuilding, 
  FaUserFriends,
  FaTools,
  FaChevronDown,
  FaEnvelope,
  FaPhone,
  FaWhatsapp
} from 'react-icons/fa';

export default function FAQs() {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      icon: <FaCalendarAlt />,
      title: "Booking Process",
      color: "#7a1313",
      questions: [
        {
          q: "How do I book a venue through Celebration Station?",
          a: "Browse available venues, select your preferred date and time, fill in the booking form with your event details, and submit. You'll receive a confirmation email once the venue approves your booking."
        },
        {
          q: "Can I modify or cancel my booking?",
          a: "Yes, you can modify or cancel your booking up to 48 hours before the event. Log in to your account, go to 'My Bookings', and select the booking you wish to modify. Cancellation fees may apply as per our policy."
        },
        {
          q: "What information do I need to make a booking?",
          a: "You'll need to provide event details (date, time, expected guests), contact information, and payment details. For certain venues, you may need to specify event type and any additional services required."
        }
      ]
    },
    {
      icon: <FaBuilding />,
      title: "Venue Information",
      color: "#9a1515",
      questions: [
        {
          q: "What types of venues are available?",
          a: "We offer a diverse range of venues including banquet halls, outdoor gardens, rooftop venues, conference rooms, and specialized event spaces. Each venue has detailed information about capacity, amenities, and features."
        },
        {
          q: "Can I visit the venue before booking?",
          a: "Yes, you can schedule a venue visit through our platform. Contact the venue directly through the venue details page or use our chat feature to arrange a viewing."
        },
        {
          q: "What amenities are typically included?",
          a: "Amenities vary by venue but often include basic furniture, lighting, air conditioning, restrooms, and parking. Specific amenities are listed on each venue's detail page."
        }
      ]
    },
    {
      icon: <FaCreditCard />,
      title: "Payments & Pricing",
      color: "#b31818",
      questions: [
        {
          q: "What payment methods are accepted?",
          a: "We accept major credit cards, bank transfers, and digital payments. All transactions are secured through our payment gateway."
        },
        {
          q: "Is there a booking deposit required?",
          a: "Yes, most venues require a deposit to secure your booking. The deposit amount varies by venue and is typically 20-50% of the total booking cost."
        },
        {
          q: "How does the refund process work?",
          a: "Refunds are processed according to our cancellation policy. The amount refunded depends on how far in advance you cancel and the venue's specific terms."
        }
      ]
    },
    {
      icon: <FaUserFriends />,
      title: "Event Services",
      color: "#cc1c1c",
      questions: [
        {
          q: "Can I book additional services through Celebration Station?",
          a: "Yes, you can book various services including catering, decoration, photography, and entertainment through our platform. These can be added during the booking process."
        },
        {
          q: "How do I coordinate multiple services for my event?",
          a: "Our platform allows you to manage all services through your dashboard. You can communicate with vendors, track preparations, and coordinate timings in one place."
        },
        {
          q: "What if a service provider cancels?",
          a: "We have backup vendors for all services. If a vendor cancels, we'll immediately arrange an alternative of similar quality at no extra cost."
        }
      ]
    },
    {
      icon: <FaTools />,
      title: "Technical Support",
      color: "#e52020",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email to reset your password."
        },
        {
          q: "What should I do if I encounter a technical issue?",
          a: "Contact our technical support team through the help center, live chat, or email at support@celebrationstation.com. We typically respond within 1-2 hours."
        },
        {
          q: "Is my personal information secure?",
          a: "Yes, we use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information about data handling."
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20 
              }}
              className="inline-block mb-8"
            >
              <div className="bg-white p-5 rounded-full shadow-lg relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gray-100 rounded-full"
                />
                <FaQuestionCircle className="text-6xl text-gray-600 relative z-10" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-[#7a1313] mb-4"
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-base text-gray-600 max-w-2xl mx-auto"
            >
              Find answers to common questions about our services
            </motion.p>
          </motion.div>

          {/* FAQ Categories */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                variants={itemVariants}
                onHoverStart={() => setHoveredCategory(categoryIndex)}
                onHoverEnd={() => setHoveredCategory(null)}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: hoveredCategory === categoryIndex ? 1.02 : 1,
                    boxShadow: hoveredCategory === categoryIndex
                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500"
                >
                  <button
                    onClick={() => {
                      setExpandedCategory(expandedCategory === categoryIndex ? null : categoryIndex);
                      setExpandedQuestion(null);
                    }}
                    className="w-full"
                  >
                    <div className="p-6 flex items-center justify-between cursor-pointer relative overflow-hidden">
                      <motion.div
                        animate={{
                          x: expandedCategory === categoryIndex ? 0 : -10,
                          opacity: expandedCategory === categoryIndex ? 0.05 : 0,
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-black"
                      />
                      <div className="flex items-center gap-4 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          className="text-2xl text-gray-600"
                        >
                          {category.icon}
                        </motion.div>
                        <h2 className="text-lg font-semibold text-black">
                          {category.title}
                        </h2>
                      </div>
                      <motion.div
                        animate={{ 
                          rotate: expandedCategory === categoryIndex ? 180 : 0,
                          scale: hoveredCategory === categoryIndex ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10"
                      >
                        <FaChevronDown className="text-xl text-gray-600" />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedCategory === categoryIndex && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-3">
                          <div className="w-full h-px bg-gradient-to-r from-gray-200 to-transparent mb-4" />
                          {category.questions.map((qa, questionIndex) => (
                            <motion.div
                              key={questionIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: questionIndex * 0.1 }}
                              className="bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors duration-300"
                            >
                              <button
                                onClick={() => setExpandedQuestion(
                                  expandedQuestion === `${categoryIndex}-${questionIndex}`
                                    ? null
                                    : `${categoryIndex}-${questionIndex}`
                                )}
                                className="w-full p-3 text-left flex justify-between items-center"
                              >
                                <span className="font-medium text-sm text-black">{qa.q}</span>
                                <motion.div
                                  animate={{ 
                                    rotate: expandedQuestion === `${categoryIndex}-${questionIndex}` ? 180 : 0 
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <FaChevronDown className="text-gray-600 text-sm" />
                                </motion.div>
                              </button>
                              <AnimatePresence>
                                {expandedQuestion === `${categoryIndex}-${questionIndex}` && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <div className="px-3 pb-3 text-sm text-gray-500">
                                      {qa.a}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <h2 className="text-xl font-bold text-[#7a1313] mb-4">Still have questions?</h2>
            <p className="text-base text-gray-600 mb-6">Our support team is here to help you</p>
            <div className="flex justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:support@celebrationstation.com"
                className="flex items-center gap-2 px-4 py-2 bg-[#7a1313] text-white rounded-lg hover:bg-[#9a1515] transition-colors duration-300 text-sm"
              >
                <FaEnvelope className="text-white" />
                <span>Email Support</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="tel:+1234567890"
                className="flex items-center gap-2 px-4 py-2 bg-[#7a1313] text-white rounded-lg hover:bg-[#9a1515] transition-colors duration-300 text-sm"
              >
                <FaPhone className="text-white" />
                <span>Call Us</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/1234567890"
                className="flex items-center gap-2 px-4 py-2 bg-[#7a1313] text-white rounded-lg hover:bg-[#9a1515] transition-colors duration-300 text-sm"
              >
                <FaWhatsapp className="text-white" />
                <span>WhatsApp</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 
