"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const services = [
    {
      title: "Venue",
      subtitle: "Banquet, Party Palace, Hotel",
      image: "/Image/image3.png",
      bgColor: "#556B2F",
      path: "/venues",
    },
    {
      title: "Makeup",
      subtitle: "Bridal Makeup, Family Makeup",
      image: "/Image/image2.png",
      bgColor: "#800000",
      path: "/makeup",
    },
    {
      title: "Decor",
      subtitle: "Stage, Mandap",
      image: "/Image/image4.png",
      bgColor: "#1E3A8A",
      path: "/decor",
    },
    {
      title: "Entertainment",
      subtitle: "DJ, Music, Microphone",
      image: "/Image/image1.png",
      bgColor: "#1E40AF",
      path: "/entertainment",
    },
  ];

  return (
    <div className="flex flex-col w-full bg-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between max-w-6xl mx-auto gap-6 mt-8">
        <div className="md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
            All-in-One Expertise:
            <br />
            <span className="text-[#6D0C0E]">Your Forever Service Partner</span>
          </h1>
        </div>
        <div className="md:w-1/2">
          <p className="text-gray-600">
            A celebration is a beautiful journey, a joyous moment where dreams
            come alive. Whether it’s a wedding, birthday, corporate event, or
            any special occasion, we believe everyone deserves a venue that
            reflects their unique vision and creates lasting memories.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div
        ref={sectionRef}
        className={`grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-12 max-w-6xl mx-auto transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {services.map((service, index) => {
          const controls = useAnimation();

          return (
            <motion.div
              key={index}
              className="flex w-full min-h-[260px] overflow-hidden rounded-2xl shadow-xl text-white relative cursor-pointer transition-transform"
              style={{ backgroundColor: service.bgColor }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              onClick={() => router.push(service.path)}
              onHoverStart={() =>
                controls.start({
                  width: "50%",
                  transition: { duration: 0.4, ease: "easeInOut" },
                })
              }
              onHoverEnd={() =>
                controls.start({
                  width: "30%",
                  transition: { duration: 0.4, ease: "easeInOut" },
                })
              }
            >
              {/* Left Text Section */}
              <div className="p-8 w-1/2 flex flex-col justify-center z-10">
                <motion.h2
                  className="text-3xl font-bold hover:underline underline-offset-4 decoration-white transition duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  {service.title}
                </motion.h2>
                <p className="mt-2 text-sm">{service.subtitle}</p>
              </div>

              {/* Right Image Section */}
              <div className="w-1/2 relative overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                {/* Animated Diagonal Overlay */}
                <motion.div
                  className="absolute top-0 left-0 h-full"
                  animate={controls}
                  initial={{ width: "30%" }}
                  style={{
                    backgroundColor: `${service.bgColor}B3`,
                    clipPath: "polygon(0 0, 100% 0, 60% 100%, 0% 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
