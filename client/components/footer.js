"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const pathname = usePathname();
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
        .footer {
          animation: slideUp 1s ease-out;
        }
        .invisible {
          opacity: 0;
        }
      `}</style>

      <footer className="bg-[#610B0B] text-white py-6 px-8 md:px-10">
        <div className="container mx-auto">
          <div
            ref={sectionRef}
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${
              isVisible ? "footer" : "invisible"
            }`}
          >
            {/* Section 1 */}
            <div className="flex flex-col">
              <img
                src="/Image/logo.png"
                alt="Celebration Station Logo"
                className="mb-5 w-32"
              />
              <p className="text-base leading-relaxed">
                At Celebration Station, we bring your dream events to life. Discover stunning venues, trusted vendors, and seamless
                planning—all within your budget. 
              </p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="#"
                  className="p-2 bg-white rounded-full text-[#610B0B] hover:bg-gray-200"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={18} />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white rounded-full text-[#610B0B] hover:bg-gray-200"
                  aria-label="Instagram"
                >
                  <FaInstagram size={18} />
                </a>
              </div>
            </div>

            {/* Section 2 */}
            <div className="flex flex-col">
              <h3 className="text-base font-bold mb-3">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/about"
                    className="hover:text-gray-300 hover:underline text-base"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/venue"
                    className="hover:text-gray-300 hover:underline text-base"
                  >
                    Venue
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-gray-300 hover:underline text-base"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="flex flex-col">
              <h3 className="text-base font-bold mb-3">Short Links</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-gray-300 hover:underline text-base"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-gray-300 hover:underline text-base"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/faqs"
                    className="hover:text-gray-300 hover:underline text-base"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            ref={sectionRef}
            className={`flex justify-center items-center mt-6 ${
              isVisible ? "footer" : "invisible"
            }`}
          >
            <p className="text-sm">
              &copy; 2025 Celebration Station. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
