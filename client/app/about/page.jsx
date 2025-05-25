'use client';

import Image from 'next/image';
import LoadingScreen from '@/components/loading/loading';
import React, { useEffect, useState, useRef } from "react";
import MainLayout from "/components/layouts/mainLayout";
import { motion, useAnimation } from "framer-motion";
import { FaGlassCheers, FaUtensils, FaMusic, FaCamera, FaUserTie, FaMagic, FaCheck } from 'react-icons/fa';

export default function About() {
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const services = [
    {
      icon: <FaGlassCheers className="text-4xl" />,
      title: "Event Planning",
      description: "Comprehensive event planning services from concept to execution",
      details: [
        "Personalized event consultation",
        "Timeline and budget management",
        "Vendor coordination",
        "On-site event management"
      ]
    },
    {
      icon: <FaUtensils className="text-4xl" />,
      title: "Catering Services",
      description: "Exquisite menu options featuring international and local cuisine",
      details: [
        "Customized menu planning",
        "Professional service staff",
        "Dietary accommodation",
        "Live cooking stations"
      ]
    },
    {
      icon: <FaMusic className="text-4xl" />,
      title: "Entertainment",
      description: "Live music, DJs, and performance artists for your events",
      details: [
        "Live bands and DJs",
        "Cultural performances",
        "Sound and lighting",
        "Dance floor setup"
      ]
    },
    {
      icon: <FaCamera className="text-4xl" />,
      title: "Photography",
      description: "Professional photography and videography services",
      details: [
        "Event photography",
        "Cinematic videography",
        "Drone coverage",
        "Same-day editing"
      ]
    },
    {
      icon: <FaUserTie className="text-4xl" />,
      title: "Staff Services",
      description: "Professional event staff, servers, and security personnel",
      details: [
        "Trained service staff",
        "Security personnel",
        "Event coordinators",
        "Valet parking"
      ]
    },
    {
      icon: <FaMagic className="text-4xl" />,
      title: "Decor & Design",
      description: "Custom themes and elegant decorations for any occasion",
      details: [
        "Theme conceptualization",
        "Floral arrangements",
        "Lighting design",
        "Stage and backdrop setup"
      ]
    }
  ];

  const features = [
    {
      icon: <FaGlassCheers className="text-4xl" />,
      title: "Experienced Team",
      description: "Our seasoned professionals bring years of expertise in event planning and management."
    },
    {
      icon: <FaMagic className="text-4xl" />,
      title: "Customizable Packages",
      description: "Flexible options tailored to match your vision and budget perfectly."
    },
    {
      icon: <FaCamera className="text-4xl" />,
      title: "Premium Venues",
      description: "State-of-the-art facilities equipped with modern amenities and elegant designs."
    }
  ];

  const stats = [
    {
      number: "1000+",
      label: "Events Hosted",
    },
    {
      number: "98%",
      label: "Client Satisfaction",
    },
    {
      number: "15+",
      label: "Years Experience",
    },
    {
      number: "50+",
      label: "Team Members",
    }
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[60vh] bg-[#7a1313] overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <Image
            src="/Image/venue-banner.jpg"
            alt="Celebration Venue"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="relative h-full flex flex-col justify-center items-center text-white text-center px-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              Welcome to Celebration Station
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl max-w-2xl"
            >
              Where Moments Become Memories
            </motion.p>
          </div>
        </motion.div>

        {/* About Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <motion.h2 
                initial={{ x: -20 }}
                whileInView={{ x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-[#7a1313]"
              >
                Our Story
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-700"
              >
                Since our establishment, Celebration Station has been the premier destination for creating magical moments and unforgettable celebrations. Our journey began with a simple vision: to provide a space where every celebration becomes an extraordinary experience.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-700"
              >
                Today, we pride ourselves on being more than just a venue - we're your partners in celebration. Our state-of-the-art facilities, coupled with our passionate team of event professionals, ensure that every detail of your special day is perfect.
              </motion.p>
            </div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-500"
            >
              <Image
                src="/Image/cs.png"
                alt="Celebration Station"
                fill
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
          </motion.div>

          {/* Services Section */}
          <div ref={sectionRef} className="mt-24">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-center text-[#7a1313] mb-12"
            >
              Our Services
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1 
                  }}
                  className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[#7a1313] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-lg opacity-95"></div>
                  
                  <div className="relative z-10 transition-colors duration-500 group-hover:text-white">
                    <div className="text-[#7a1313] mb-4 group-hover:text-white transition-colors duration-500">{service.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-gray-600 group-hover:text-gray-200 transition-colors duration-500">{service.description}</p>
                    
                    <ul className="mt-4 space-y-2 overflow-hidden">
                      {service.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        >
                          <FaCheck className="mr-2 text-white" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="mt-24 bg-gradient-to-b from-white to-gray-50 py-16">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-7xl mx-auto px-4"
            >
              <motion.h2 
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                className="text-4xl font-bold text-[#7a1313] mb-4"
              >
                Why Choose Celebration Station?
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
              >
                Your celebration deserves nothing but the best. We combine expertise, creativity, and dedication to make your events truly unforgettable.
              </motion.p>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="text-[#7a1313] mb-6 group-hover:text-[#9a1515] transition-colors duration-300"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-semibold mb-4 group-hover:text-[#7a1313] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-8 bg-[#7a1313] rounded-xl text-white"
              >
                <h3 className="text-2xl font-semibold mb-4">Ready to Create Your Perfect Celebration?</h3>
                <p className="mb-6">Let us help you bring your vision to life with our expert team and premium venues.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#7a1313] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
                >
                  Contact Us Today
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

