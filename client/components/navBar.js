"use client";
import React, { useState, useEffect } from "react";
import ProfilePopup from "./ProfilePopup";
import NotificationBell from "./NotificationBell";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

export default function NavBar() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [activeLink, setActiveLink] = useState(pathname);
  const [userImage, setUserImage] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === "authenticated" && session?.user) {
        setIsAuthenticated(true);
        setUserImage(session.user.image);
        setUserDetails(session.user);
        setUsername(session.user.email.split('@')[0]);
        return;
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            setIsAuthenticated(true);
            const response = await axios.get('http://localhost:5000/api/auth/user', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data.user);
            setUsername(response.data.user.username);
            if (response.data.user.avatar) {
              setUserImage(response.data.user.avatar);
            }
            return;
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }
      setIsAuthenticated(false);
    };

    checkAuth();
  }, [status, session]);

  const toggleMobileMenu = () => setMobileMenu(!mobileMenu);
  const closeMobileMenu = () => setMobileMenu(false);

  const handleLinkClick = (path) => {
    setActiveLink(path);
    closeMobileMenu();
  };

  return (
    <nav className="bg-[#6D0C0E] text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <img src="/Image/logo.png" alt="Logo" className="w-22 h-20" />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {["/", "/about", "/venues", "/contact"].map((path) => (
              <div key={path} className="relative">
                <Link
                  href={path}
                  className={`text-white transition-all duration-200 ${
                    activeLink === path ? "font-bold" : ""
                  }`}
                  onClick={() => handleLinkClick(path)}
                >
                  {path === "/" ? "Home" : path.substring(1).charAt(0).toUpperCase() + path.slice(2)}
                </Link>
                {activeLink === path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Profile / Login */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {isAuthenticated && (
              <NotificationBell />
            )}
            {isAuthenticated ? (
              <div
                onMouseEnter={() => setShowProfilePopup(true)}
                onMouseLeave={() => setShowProfilePopup(false)}
                className="relative flex items-center"
              >
                <div className="flex items-center p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#6D0C0E]">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-[#6D0C0E] flex items-center justify-center">
                              <span class="text-white text-lg font-medium">
                                ${userDetails?.firstName?.[0] || ''}${userDetails?.lastName?.[0] || ''}
                              </span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#6D0C0E] flex items-center justify-center">
                        {userDetails?.firstName && userDetails?.lastName ? (
                          <span className="text-white text-lg font-medium">
                            {userDetails.firstName[0]}{userDetails.lastName[0]}
                          </span>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {showProfilePopup && (
                  <div className="absolute right-0 mt-2">
                    <ProfilePopup onClose={() => setShowProfilePopup(false)} />
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center px-4 py-2 border border-white rounded-full text-white hover:bg-white hover:text-[#6D0C0E] transition-all duration-200"
              >
                <span>Log in</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-[#6D0C0E] text-white">
          <div className="space-y-4 py-4">
            {["/", "/about", "/venues", "/contact"].map((path) => (
              <div key={path} className="relative">
                <Link
                  href={path}
                  className={`block text-center py-2 ${activeLink === path ? "font-bold" : ""}`}
                  onClick={() => {
                    handleLinkClick(path);
                    closeMobileMenu();
                  }}
                >
                  {path === "/" ? "Home" : path.substring(1).charAt(0).toUpperCase() + path.slice(2)}
                </Link>
                {activeLink === path && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </div>
            ))}
            <Link
              href="/login"
              className="block text-center px-4 py-2 border border-white rounded-full text-white hover:bg-white hover:text-[#6D0C0E] transition-all duration-200"
              onClick={closeMobileMenu}
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
