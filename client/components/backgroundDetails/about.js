'use client';

import Image from 'next/image';

export default function WhyCelebrationStation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7a1313] text-white">
      <div className="max-w-4xl flex flex-col md:flex-row items-center gap-8 px-6 py-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl font-bold">Why <span className="text-[#ffd700]">Celebration Station?</span></h2>
          <p className="mt-4 text-lg">
            At Celebration Station, we bring your dream events to life. Discover stunning venues, trusted vendors, and seamless planning—
            all within your budget. Make every celebration unforgettable with us!
          </p>
          <p className="mt-4 text-lg">
            At Celebration Station, we bring your dream events to life. Discover stunning venues, trusted vendors and seamless planning—
            all within your budget. Make every celebration unforgettable with us!
          </p>
          <button className="mt-6 bg-[#a52a2a] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#8b0000]" href="/about">
            About Us
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image src="/Image/logo.png" alt="Celebration Station Logo" width={800} height={800} />
        </div>
      </div>
    </div>
  );
}