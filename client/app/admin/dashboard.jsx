"use client"
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import axios from 'axios'; // Import Axios

export default function AdminDashboard() {
  const [registrationDetails, setRegistrationDetails] = useState(null);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/registration-details'); // Adjust the endpoint as necessary
        setRegistrationDetails(response.data);
      } catch (error) {
        console.error("Error fetching registration details:", error);
        toast.error("Failed to fetch registration details.");
      }
    };

    fetchRegistrationDetails();
  }, []);

  return (
    <div className="bg-[#EBE4E4] min-h-screen flex flex-col items-center p-8">
      <Link href="/" className="mb-6">
        <img src="/Image/logo.png" alt="Logo" className="h-12" />
      </Link>
      <ToastContainer />

      <div className="bg-white shadow-lg p-8 w-full max-w-4xl rounded-lg">
        <h2 className="text-[#6D0C0E] text-3xl font-bold text-center mb-6">
          Admin Dashboard
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Here are your registration details.
        </p>

        {registrationDetails ? (
          <div className="space-y-4">
            {Object.entries(registrationDetails).map(([key, value]) => (
              <p key={key} className="text-gray-700">
                <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {Array.isArray(value) ? value.length + " file(s) uploaded" : value || "N/A"}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">Loading registration details...</p>
        )}
      </div>
    </div>
  );
}
