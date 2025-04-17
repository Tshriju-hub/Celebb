"use client";
import React, { useState, useEffect } from "react";
import ProfilePopup from "./ProfilePopup";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";


export default function NavBar() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const [username, setUsername] = useState(""); // State for username


  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Check next-auth session
      if (status === "authenticated") {
        setIsAuthenticated(true);
        return;
      }
      
      // Check local token
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;
          if (decoded.exp > currentTime) {
            setIsAuthenticated(true);
            return;
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }
      setIsAuthenticated(false);
    };

    checkAuth();
  }, [status]);


  const toggleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  const closeMobileMenu = () => {
    setMobileMenu(false);
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
              <Link
                key={path}
                href={path}
                className={`hover:underline decoration-2 decoration-white transition-all duration-200 ${
                  pathname === path ? "underline decoration-2" : ""
                }`}
              >
                {path === "/" ? "Home" : path.substring(1).charAt(0).toUpperCase() + path.slice(2)}
              </Link>
            ))}
          </div>

          {/* Profile/Sign In Button */}
          <div className="hidden md:flex items-center space-x-2 relative">
            {isAuthenticated ? (
              <button
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                className="flex items-center px-4 py-2 border border-white rounded-full text-white hover:bg-white hover:text-[#6D0C0E] transition-all duration-200"
              >
                <span>Hi, Welcome</span>


                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center px-4 py-2 border border-white rounded-full text-white hover:bg-white hover:text-[#6D0C0E] transition-all duration-200"
              >
                <span>Log in</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                  ></path>
                </svg>
              </Link>
            )}

            {showProfilePopup && (
              <div className="absolute right-0 mt-2">
                <ProfilePopup onClose={() => setShowProfilePopup(false)} />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
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
              <Link
                key={path}
                href={path}
                className={`block text-center hover:underline decoration-2 decoration-white transition-all duration-200 ${
                  pathname === path ? "underline decoration-2" : ""
                }`}
                onClick={closeMobileMenu}
              >
                {path === "/" ? "Home" : path.substring(1).charAt(0).toUpperCase() + path.slice(2)}
              </Link>
            ))}
            <Link
              href="/signin"
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