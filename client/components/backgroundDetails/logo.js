import React from "react";
import Marquee from "react-fast-marquee";
import Image from 'next/image';

export default function Logo() {
  return (
    <>
      {/* Title Section */}
      <div className="flex flex-col items-center w-full h-auto bg-[#9B6462] py-8 overflow-hidden">
        <h2 className="text-white text-2xl font-semibold">
          Our Trusted Partners and Vendors
        </h2>
      </div>

      {/* Logo Marquee Section */}
      <div className="w-full bg-white py-4">
        <Marquee gradient={false} speed={50} style={{ width: '100%' }}>
          <div className="flex flex-nowrap items-center justify-center">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center justify-center w-36 mx-4">
                <Image
                  src={`/Image/logo(${num}).png`}
                  alt={`Logo ${num}`}
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </div>
            ))}
            {/* Duplicate to ensure seamless scrolling */}
            {[1, 2, 3, 4].map((num) => (
              <div key={`duplicate-${num}`} className="flex items-center justify-center w-36 mx-4">
                <Image
                  src={`/Image/logo(${num}).png`}
                  alt={`Logo ${num}`}
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </>
  );
}
