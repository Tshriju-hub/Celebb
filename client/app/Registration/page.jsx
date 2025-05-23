"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function PartyPalaceRegistration() {
  const [step, setStep] = useState(1);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    name: "",
    address: "",
    phone: "",
    established: "",
    advancePayment: "",
    spacePreference: "",
    capacity: "",
    numberOfHalls: "",
    foodSilverPrice: "",
    foodGoldPrice: "",
    foodDiamondPrice: "",
    makeupPrice: "",
    decorationPrice: "",
    entertainmentPrice: "",
    hallImages: [],
    companyRegistration: [],
    ownerCitizenship: [],
    description: "",
    category: "",
    qrCode: [],
    owner: "",
    status: "pending",
  });

  if(session?.user?.role !== "owner") {
    window.location.href = "/register-owner";
  }

  useEffect(() => {
    if (session?.user?.id) {
      setFormData((prev) => ({
        ...prev,
        owner: session.user.id,
      }));
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, [field]: files }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, hallImages: files }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.ownerName || !formData.ownerEmail || !formData.name || !formData.phone || !formData.established || !formData.advancePayment) {
        toast.error("Please fill in all required fields on this page.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.spacePreference || !formData.numberOfHalls || !formData.foodSilverPrice || !formData.foodGoldPrice || !formData.foodDiamondPrice) {
        toast.error("Please fill in all required fields on this page.");
        return;
      }
    }
    if (step === 3) {
      if (!formData.makeupPrice || !formData.decorationPrice || !formData.entertainmentPrice) {
        toast.error("Please fill in all required fields on this page.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);
  const goToStep = (stepNumber) => setStep(stepNumber);

  const handleSubmit = async () => {
    const numericFields = [
      "advancePayment",
      "capacity",
      "numberOfHalls",
      "foodSilverPrice",
      "foodGoldPrice",
      "foodDiamondPrice",
      "makeupPrice",
      "decorationPrice",
      "entertainmentPrice",
    ];

    numericFields.forEach((field) => {
      if (formData[field]) {
        formData[field] = Number(formData[field]);
      }
    });

    if (!formData.ownerName || !formData.ownerEmail || !formData.name || !formData.owner) {
      toast.error("Missing required owner or venue details.");
      return;
    }

    try {
      const data = new FormData();

      // Append non-file fields
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "hallImages" &&
          key !== "companyRegistration" &&
          key !== "ownerCitizenship" &&
          key !== "qrCode"
        ) {
          data.append(key, value);
        }
      });

      // Append files
      formData.hallImages.forEach((file) => {
        data.append("hallImages", file);
      });

      formData.companyRegistration.forEach((file) => {
        data.append("companyRegistration", file);
      });

      formData.ownerCitizenship.forEach((file) => {
        data.append("ownerCitizenship", file);
      });

      formData.qrCode.forEach((file) => {
        data.append("qrCode", file);
      });

      data.append("role", "owner");

      const response = await axios.post(
        "http://localhost:5000/api/auth/register-owner",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success("Owner registration submitted successfully!");
        setFormData({});
        window.location.href = "/";
      } else {
        toast.error(`Error: ${response.data.message || "Registration failed."}`);
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("An error occurred while submitting the registration.");
    }
  };


  return (
    <div className="bg-[#EBE4E4] min-h-screen flex flex-col items-center p-8">
      <Link href="/" className="mb-6">
        <img src="/Image/logo.png" alt="Logo" className="h-12" />
      </Link>
      <ToastContainer />

      <div className="bg-white shadow-lg p-8 w-full max-w-4xl rounded-lg">
        <h2 className="text-[#6D0C0E] text-3xl font-bold text-center mb-6">
          Party Palace Registration
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Please fill out the form below to register your venue. All fields marked with * are important.
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => goToStep(num)}
              className={`p-2 rounded-full w-10 h-10 flex items-center justify-center text-white ${
                step === num ? "bg-[#6D0C0E]" : "bg-gray-400"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Owner Details</h3>
            <p className="text-gray-600">Enter the owner's details.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Owner Name <span className="text-red-500">*</span></label>
                <input
                  name="ownerName"
                  placeholder="e.g., Shreeju Thapa"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Owner Email <span className="text-red-500">*</span></label>
                <input
                  name="ownerEmail"
                  placeholder="e.g., ShreejuThapa@example.com"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Owner Phone Number</label>
                <input
                  name="ownerPhone"
                  placeholder="e.g., 9801234567"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Venue Details</h3>
            <p className="text-gray-600">Enter the basic details about your venue.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Venue Name <span className="text-red-500">*</span></label>
                <input
                  name="name"
                  placeholder="e.g., Kathmandu Banquet"
                  value={formData.name}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Address</label>
                <input
                  name="address"
                  placeholder="e.g., Thamel, Kathmandu"
                  value={formData.address}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <input
                  name="phone"
                  placeholder="e.g., 9801234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Year Established <span className="text-red-500">*</span></label>
                <input
                  name="established"
                  placeholder="e.g., 2015"
                  value={formData.established}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Advance Payment (NPR) <span className="text-red-500">*</span></label>
                <input
                  name="advancePayment"
                  placeholder="e.g., 50000"
                  value={formData.advancePayment}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Capacity</label>
                <input
                  name="capacity"
                  placeholder="e.g., 500 people"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Description</label>
                <input
                  name="description"
                  placeholder="e.g., A Good Hall"
                  value={formData.description}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
                </div>
                <div>
                <label className="block text-gray-700">Category</label>
                <input
                  name="category"
                  placeholder="e.g., One Category dorpdown"
                  value={formData.category}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
                </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={nextStep}
                className="bg-[#6D0C0E] text-white px-4 py-2 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Venue Space & Pricing</h3>
            <p className="text-gray-600">Provide additional venue space and pricing information.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Space Preference <span className="text-red-500">*</span></label>
                <input
                  name="spacePreference"
                  placeholder="e.g., Open Hall, Closed Hall"
                  value={formData.spacePreference}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Number of Halls <span className="text-red-500">*</span></label>
                <input
                  name="numberOfHalls"
                  placeholder="e.g., 3"
                  value={formData.numberOfHalls}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Food Silver Package Price <span className="text-red-500">*</span></label>
                <input
                  name="foodSilverPrice"
                  placeholder="e.g., 3000"
                  value={formData.foodSilverPrice}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Food Gold Package Price <span className="text-red-500">*</span></label>
                <input
                  name="foodGoldPrice"
                  placeholder="e.g., 5000"
                  value={formData.foodGoldPrice}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Food Diamond Package Price <span className="text-red-500">*</span></label>
                <input
                  name="foodDiamondPrice"
                  placeholder="e.g., 7000"
                  value={formData.foodDiamondPrice}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-[#6D0C0E] text-white px-4 py-2 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Additional Services Pricing</h3>
            <p className="text-gray-600">Provide pricing details for additional services.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Makeup Price <span className="text-red-500">*</span></label>
                <input
                  name="makeupPrice"
                  placeholder="e.g., 5000"
                  value={formData.makeupPrice}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Decoration Price <span className="text-red-500">*</span></label>
                <input
                  name="decorationPrice"
                  placeholder="e.g., 15000"
                  value={formData.decorationPrice}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Entertainment Price <span className="text-red-500">*</span></label>
                <input
                  name="entertainmentPrice"
                  placeholder="e.g., 10000"
                  value={formData.entertainmentPrice}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-[#6D0C0E] text-white px-4 py-2 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Upload Images & Documents</h3>
            <p className="text-gray-600">Please upload relevant images and documents.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Hall Images</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded cursor-pointer bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700">Company Registration Document</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, "companyRegistration")}
                  className="w-full p-2 border rounded cursor-pointer bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700">Owner's Citizenship Document</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, "ownerCitizenship")}
                  className="w-full p-2 border rounded cursor-pointer bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700">Qr Code</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, "qrCode")}
                  className="w-full p-2 border rounded cursor-pointer bg-gray-100"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-[#6D0C0E] text-white px-4 py-2 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Review & Submit</h3>
            <p className="text-gray-600">Please review all details before submission.</p>
            <div className="p-4 border rounded bg-gray-50">
              {Object.entries(formData).map(([key, value]) => (
                <p key={key} className="text-gray-700">
                  <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {Array.isArray(value) ? value.length + " file(s) uploaded" : value || "N/A"}
                </p>
              ))}

            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="bg-gray-500 text-white px-4 py-2 rounded">Back</button>
              <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
