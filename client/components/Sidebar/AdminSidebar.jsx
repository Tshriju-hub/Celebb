'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Venues", href: "/admin/venues" },
    { name: "News", href: "/admin/news" },
  ];

  return (
    <aside className="w-64 bg-[#7a1313] shadow-lg">
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <Link href="/">
            <Image
              src="/Image/logo.png" // Add your logo source path here
              alt="Home Logo"
              width={100}
              height={100}
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-white text-[#7a1313]"  // active link color
                      : "text-white hover:bg-[#9b1e1e]"  // text color & hover
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
