'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function BookInquiry() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef();

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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          0% {
            transform: translateY(50%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animated {
          animation: slideUp 1s ease-out;
        }
        .invisible {
          opacity: 0;
        }
      `}</style>

      <div className="bg-[#6D0C0E] min-h-[50vh] flex items-center justify-center p-4">
        <div 
          ref={sectionRef}
          className={`text-center ${isVisible ? "animated" : "invisible"}`}
        >
          <h1 className="text-white text-3xl font-bold mb-8">
            START TO BUILD EVENT WITH US IN ONE CLICK
          </h1>
          <div className="flex space-x-8 justify-center">
            {/* Book Now div - Link to Venue Page */}
            <div className="bg-white p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center border-4 border-dotted border-[#6D0C0E] rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#6D0C0E"
                    className="w-12 h-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                  </svg>
                </div>
              </div>
              <Link href="/venue">
                <h2 className="text-[#6D0C0E] text-xl font-bold hover:underline cursor-pointer">Book Now</h2>
              </Link>
              <p className="text-gray-600">Book the best vendors</p>
            </div>
            {/* Send Inquiry div - Link to Contact Page */}
            <div className="bg-white p-6 rounded-2xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center border-4 border-dotted border-[#6D0C0E] rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#6D0C0E"
                    className="w-12 h-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 3.75h-9A2.25 2.25 0 005.25 6v12a2.25 2.25 0 002.25 2.25h9A2.25 2.25 0 0018.75 18V6a2.25 2.25 0 00-2.25-2.25zM12 12.75L5.25 6M12 12.75l6.75-6.75"
                    />
                  </svg>
                </div>
              </div>
              <Link href="/contact">
                <h2 className="text-[#6D0C0E] text-xl font-bold hover:underline cursor-pointer">Send Inquiry</h2>
              </Link>
              <p className="text-gray-600">Talk your queries, with us</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
