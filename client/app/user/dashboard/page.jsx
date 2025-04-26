"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Sidebar from "../../../components/Sidebar/Sidebar.jsx";
import axios from "axios";
import { toast } from "react-toastify";

export default function UserDashboardProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (status === "authenticated" && session?.user?.token) {
        try {
          const response = await axios.get("http://localhost:5000/api/auth/user", {
            headers: {
              Authorization: `Bearer ${session.user.token}`,
            },
          });
          setUserDetails(response.data.user);
        } catch (err) {
          console.error("Error fetching user details:", err);
          if (err.response?.status === 401) {
            toast.error("Session expired. Please sign in again.");
            await signOut({ redirect: false });
            router.push("/login");
          } else {
            toast.error("Failed to fetch user details. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, [status, session, router]);

  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const getUsername = () => {
    if (!userDetails) return "";
    if (userDetails.provider === "google") {
      return userDetails.email?.split('@')[0] || "unknown";
    }
    return userDetails.username || userDetails.email?.split('@')[0] || "unknown";
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-600 font-medium text-lg">Failed to fetch user details.</p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold text-[#7a1313]">Dashboard & Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#7a1313] shadow">
              {(userDetails.image || userDetails.avatar) ? (
                <img 
                  src={userDetails.image || userDetails.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 font-bold">
                        ${userDetails.firstName?.[0] || ''}${userDetails.lastName?.[0] || ''}
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 font-bold">
                  {userDetails.firstName?.[0] || ''}{userDetails.lastName?.[0] || ''}
                </div>
              )}
            </div>
            <button className="mt-4 px-5 py-2 bg-[#7a1313] text-white rounded-md hover:bg-[#5e0f0f] transition">
              Change Photo
            </button>
            <h2 className="mt-4 text-xl font-semibold">
              {userDetails.firstName} {userDetails.lastName}
            </h2>
            <p className="text-gray-500">{userDetails.email}</p>
            <p className="text-gray-500 mt-1">@{getUsername()}</p>
            <p className="text-sm text-gray-400 mt-1 italic">
              Joined on {formatDate(userDetails.createdAt)}
            </p>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-[#7a1313]">Profile Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mb-2">
                  <span className="font-medium">Username:</span>{" "}
                  {getUsername()}
                </p>
                <p className="mb-2">
                  <span className="font-medium">First Name:</span>{" "}
                  {userDetails.firstName}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Last Name:</span>{" "}
                  {userDetails.lastName}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Email:</span> {userDetails.email}
                </p>
              </div>
              <div>
                {/* Optional additional profile info */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
