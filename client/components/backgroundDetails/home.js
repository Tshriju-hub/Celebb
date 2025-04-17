"use client";
import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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

  return (
    <div className="flex flex-col w-full bg-gray-100 mt-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between max-w-6xl mx-auto gap-6">
        {/* Left Section: Heading */}
        <div className="md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
            All-in-One Expertise:{" "}
            <br />
            <span className="text-[#6D0C0E]">Your Forever Service Partner</span>
          </h1>
        </div>

        {/* Right Section: Description */}
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
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 px-8 py-12 max-w-6xl mx-auto transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {[
          {
            title: "Venue ",
            subtitle: "Banquet, Party Palace, Hotel",
            image: "/Image/image1.png",
            bgColor: "bg-[#556B2F]",
          },
          {
            title: "Makeup ",
            subtitle: "Bridal Makeup, Family Makeup",
            image: "/Image/image2.png",
            bgColor: "bg-[#800000]",
          },
          {
            title: "Decor ",
            subtitle: "Stage, Mandap",
            image: "/Image/image3.png",
            bgColor: "bg-[#1E3A8A]",
          },
          {
            title: "Entertainment ",
            subtitle: "DJ, Music, Microphone",
            image: "/Image/image1.png",
            bgColor: "bg-[#1E40AF]",
          },
        ].map((service, index) => (
          <div
            key={index}
            className={`flex overflow-hidden rounded-lg shadow-lg text-white ${service.bgColor} relative`}
          >
            {/* Left Text Section */}
            <div className="p-6 w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl font-bold">{service.title}</h2>
              <p className="mt-2 text-sm">{service.subtitle}</p>
            </div>

            {/* Right Image Section */}
            <div className="w-1/2 relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
