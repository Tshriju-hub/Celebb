import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const VendorJoin = () => {
  const { data: session } = useSession();
  const [hasRegisteredVenue, setHasRegisteredVenue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVenueRegistration = async () => {
      if (session?.user?.role === 'owner' && session?.user?.token) {
        try {
          const response = await axios.post(
            "http://localhost:5000/api/auth/registrations/owner",
            { ownerId: session.user.id },
            {
              headers: {
                Authorization: `Bearer ${session.user.token}`
              }
            }
          );
          setHasRegisteredVenue(response.data && response.data.length > 0);
        } catch (error) {
          console.error('Error checking venue registration:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkVenueRegistration();
  }, [session]);

  return (
    <div className="flex bg-[#f5efeb] min-h-screen w-full">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col justify-center px-16 relative">
        {/* Move Text Higher */}
        <div className="absolute top-1/4">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 px-28">
            Are you a <span className="text-[#8f1919] font-bold">vendor</span>?
          </h1>
          <p className="text-gray-600 mt-2 px-16">
            1000+ Vendors who have successfully boosted their business <br />
            with us
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-36 flex flex-col items-center space-y-5">
          {session?.user?.role === 'owner' ? (
            hasRegisteredVenue ? (
              <Link href="/owner/dashboard">
                <button className="w-60 border border-[#8f1919] bg-white text-[#8f1919] font-semibold py-3 rounded-md text-lg hover:bg-[#8f1919] hover:text-white transition-all">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/Registration">
                <button className="w-60 border border-[#8f1919] bg-white text-[#8f1919] font-semibold py-3 rounded-md text-lg hover:bg-[#8f1919] hover:text-white transition-all">
                  Register Venue
                </button>
              </Link>
            )
          ) : (
            <Link href="/register-owner">
              <button className="w-60 border border-[#8f1919] bg-white text-[#8f1919] font-semibold py-3 rounded-md text-lg hover:bg-[#8f1919] hover:text-white transition-all">
                Join Now
              </button>
            </Link>
          )}

          <Link href="/contact">
            <button className="w-60 border border-[#8f1919] bg-white text-[#8f1919] font-semibold py-3 rounded-md text-lg hover:bg-[#8f1919] hover:text-white transition-all">
              Contact us
            </button>
          </Link>
        </div>
      </div>

      {/* Right Section - Full Image */}
      <div className="w-1/2 h-screen relative">
        <Image
          src="/Image/image.png"
          alt="Handshake"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
};

export default VendorJoin;
