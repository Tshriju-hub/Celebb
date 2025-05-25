'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FaUser, FaCalendarAlt, FaNewspaper, FaHome, FaFacebookMessenger, FaImages } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { BsBuilding } from 'react-icons/bs';
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function OwnerSidebar() {
  const pathname = usePathname();
  const [venueStatus, setVenueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchVenueStatus = async () => {
      try {
        if (status === 'loading') return;
        
        if (status === 'unauthenticated') {
          setError('Please log in to access the dashboard');
          setLoading(false);
          return;
        }

        if (!session?.user?.token || !session?.user?.id) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.post(
          "http://localhost:5000/api/auth/registrations/owner",
          { ownerId: session.user.id },
          {
            headers: {
              Authorization: `Bearer ${session.user.token}`
            }
          }
        );

        if (response.data && response.data.length > 0) {
          setVenueStatus(response.data[0].status);
        } else {
          setVenueStatus('pending');
        }
      } catch (error) {
        console.error('Error fetching venue status:', error);
        setError('Failed to fetch venue status');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueStatus();
  }, [session, status]);

  const navItems = [
    {
      name: "Dashboard", 
      href: "/owner/dashboard",
      icon: <MdDashboard className="w-5 h-5" />
    },
    ...(venueStatus === 'approved' ? [
      {
        name: "Messages",
        href: "/owner/messages",
        icon: <FaFacebookMessenger className="w-5 h-5" />
      },
      {
        name: "Bookings", 
        href: "/owner/bookings",
        icon: <FaCalendarAlt className="w-5 h-5" />
      },
      {
        name: "News", 
        href: "/owner/news",
        icon: <FaNewspaper className="w-5 h-5" />
      },
      {
        name: "Services", 
        href: "/owner/services",
        icon: <FaImages className="w-5 h-5" />
      }
    ] : [])
  ];

  if (loading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <Link href="/" className="flex justify-center">
              <Image
                src="/Image/logo.png"
                alt="Home Logo"
                width={100}
                height={100}
                className="hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#7a1313] border-t-transparent"></div>
          </div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <Link href="/" className="flex justify-center">
              <Image
                src="/Image/logo.png"
                alt="Home Logo"
                width={100}
                height={100}
                className="hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex justify-center">
            <Image
              src="/Image/logo.png"
              alt="Home Logo"
              width={100}
              height={100}
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    pathname === item.href
                      ? "bg-[#7a1313] text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className={`${
                    pathname === item.href
                      ? "text-white"
                      : "text-gray-500 group-hover:text-[#7a1313]"
                  }`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
          >
            <FaHome className="w-5 h-5 text-gray-500 group-hover:text-[#7a1313]" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}