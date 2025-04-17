'use client';

import Image from 'next/image';
import LoadingScreen from '@/components/loading/loading';
import React, { useEffect, useState, useRef } from "react";
import MainLayout from "/components/layouts/mainLayout";

export default function About() {
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-white text-gray-800">
      <div className="bg-[#7a1313] text-white py-8 px-6 text-center">
        <h1 className="text-4xl font-bold">About Celebration Station</h1>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-[#7a1313]">Creating Unforgettable Celebrations</h2>
            <p className="mt-4 text-lg">
              At Celebration Station, we bring your special moments to life with elegance and flair. As a multi-venue party palace,
              we cater to all your event needs, from weddings and birthdays to corporate gatherings and cultural celebrations.
            </p>
            <p className="mt-4 text-lg">
              Our beautifully designed spaces, combined with world-class service, ensure your event becomes an unforgettable experience.
              Whether it's an intimate gathering or a grand affair, Celebration Station has the perfect venue and ambiance to make your vision a reality.
            </p>
          </div>
          <div className="flex justify-center">
            <Image src="/Image/cs.png" alt="Celebration Station Logo" width={500} height={500} />
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-[#7a1313]">Our Passion, Your Event</h2>
          <p className="mt-4 text-lg">
            We believe every celebration deserves a personal touch. That’s why our dedicated team works closely with you to plan and execute every detail,
            ensuring your event reflects your unique style and preferences.
          </p>
          <p className="mt-4 text-lg">
            With versatile venues, customizable packages, and a commitment to excellence, Celebration Station is your ultimate destination for hosting
            memorable events. Let us take care of the details while you focus on making memories that last a lifetime!
          </p>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
