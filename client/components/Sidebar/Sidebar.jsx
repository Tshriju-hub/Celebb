'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FaUser, FaGift, FaCog, FaHome,FaFacebookMessenger  } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { 
      name: "Dashboard", 
      href: "/user/dashboard",
      icon: <MdDashboard className="w-5 h-5" />
    },
    {
      name: "Messages",
      href: "/user/messages",
      icon: <FaFacebookMessenger  className="w-5 h-5" />
    },
    { 
      name: "Loyalty", 
      href: "/user/loyalty",
      icon: <FaGift className="w-5 h-5" />
    },
    { 
      name: "Settings", 
      href: "/user/settings",
      icon: <FaCog className="w-5 h-5" />
    }
  ];

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
