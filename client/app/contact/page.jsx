"use client";

import MainLayout from "@/components/layouts/mainLayout";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserLeafletMap from "@/components/googleMap/leaflet";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        setFormData({
          name: "",
          email: "",
          contact: "",
          phone: "",
          message: "",
        });
      } else {
        toast.error("Message not sent", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-[#EBE4E4] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 mt-16">
            {[
              { icon: <MapPin color="#6D0C0E" />, title: "Address", content: "Kathmandu, Nepal" },
              { icon: <Clock color="#6D0C0E" />, title: "Opening Hours", content: "Monday - Friday : 9am - 6pm\nSaturday - Sunday : Closed" },
              { icon: <Phone color="#6D0C0E" />, title: "Contact No.", content: "9846569269, 9804560691" },
              { icon: <Mail color="#6D0C0E" />, title: "Email Us", content: "celebrationstation@gmail.com" },
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 shadow-md rounded-md flex items-center space-x-2 transition-transform transform hover:scale-105 hover:shadow-lg">
                {item.icon}
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm whitespace-pre-line">{item.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form and Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-center text-[#6D0C0E]">STAY CONNECTED WITH <span className="text-black">US</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "name", label: "Full Name", placeholder: "Shreeju Thapa" },
                  { name: "email", label: "Email Address", placeholder: "Shreeju.Thapa@example.com" },
                  { name: "contact", label: "Contact No.", placeholder: "+977-9800000000" },
                  { name: "phone", label: "Phone No.", placeholder: "01-1234567" },
                ].map((field, index) => (
                  <div key={index} className="flex flex-col">
                    <label htmlFor={field.name} className="text-sm text-gray-700 mb-1">{field.label}</label>
                    <input
                      id={field.name}
                      type={field.name === "email" ? "email" : "text"}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      className="border p-3 w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6D0C0E] transition duration-200"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <label htmlFor="message" className="text-sm text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="border p-3 w-full h-32 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6D0C0E] transition duration-200"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-gray-400 px-6 py-2 rounded-lg hover:bg-[#6D0C0E] hover:text-white transition border border-gray-400"
                disabled={loading}
              >
                {loading ? "Submitting..." : "SUBMIT"}
              </button>
            </form>
            {/* Map */}
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
              <UserLeafletMap />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </MainLayout>
  );
}
