"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";

// Import components
import OwnerDetails from "./components/OwnerDetails";
import VenueDetails from "./components/VenueDetails";
import VenueSpace from "./components/VenueSpace";
import AdditionalServices from "./components/AdditionalServices";
import DocumentUpload from "./components/DocumentUpload";
import ReviewSubmit from "./components/ReviewSubmit";

export default function PartyPalaceRegistration() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
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
    categories: [],
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
    setFormData((prev) => ({ ...prev, hallImages: [...prev.hallImages, ...files] }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      hallImages: prev.hallImages.filter((_, i) => i !== index)
    }));
  };

  const isStepComplete = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return !!(formData.ownerName && formData.ownerEmail && formData.ownerPhone);
      case 2:
        return !!(formData.name && formData.address && formData.phone && 
                 formData.established && formData.advancePayment && formData.capacity &&
                 formData.categories.length > 0);
      case 3:
        return !!(formData.spacePreference && formData.numberOfHalls && 
                 formData.foodSilverPrice && formData.foodGoldPrice && formData.foodDiamondPrice);
      case 4:
        return !!(formData.makeupPrice && formData.decorationPrice && formData.entertainmentPrice);
      case 5:
        return !!(formData.hallImages.length > 0 && formData.companyRegistration.length > 0 && 
                 formData.ownerCitizenship.length > 0);
      default:
        return false;
    }
  };

  const handleStepClick = (stepNumber) => {
    // Only allow clicking on completed steps or the next available step
    const maxCompletedStep = Math.max(...completedSteps);
    if (stepNumber <= maxCompletedStep || stepNumber === maxCompletedStep + 1) {
      // If trying to move to the next step, validate current step first
      if (stepNumber === maxCompletedStep + 1) {
        if (!isStepComplete(step)) {
          toast.error("Please complete the current step before proceeding.");
        return;
        }
      }
      setStep(stepNumber);
    }
  };

  const nextStep = () => {
    if (!isStepComplete(step)) {
      switch (step) {
        case 1:
          toast.error("Please fill in all required owner details.");
          break;
        case 2:
          toast.error("Please fill in all required venue details.");
          break;
        case 3:
          toast.error("Please fill in all required space and pricing details.");
          break;
        case 4:
          toast.error("Please fill in all required service pricing details.");
          break;
        case 5:
          toast.error("Please upload all required documents.");
          break;
        default:
          toast.error("Please complete the current step before proceeding.");
      }
      return;
    }

    // Mark current step as completed
    setCompletedSteps(prev => [...new Set([...prev, step])]);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

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

    if (!formData.ownerName || !formData.ownerEmail || !formData.name || !formData.owner || !formData.categories || formData.categories.length === 0) {
      toast.error("Missing required owner or venue details.");
      return;
    }

    try {
      const data = new FormData();

      // Handle categories - join them into a comma-separated string
      const categoryString = formData.categories.join(',');
      data.append('category', categoryString);

      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "hallImages" &&
          key !== "companyRegistration" &&
          key !== "ownerCitizenship" &&
          key !== "qrCode" &&
          key !== "categories" // Skip categories as we've already handled it
        ) {
          data.append(key, value);
        }
      });

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
      toast.error(error.response?.data?.message || "An error occurred while submitting the registration.");
    }
  };

  return (
    <div className="min-h-screen bg-[#6D0C0E] flex flex-col items-center p-8">
      <Link href="/" className="mb-6">
        <img src="/Image/logo.png" alt="Logo" className="h-20 w-auto" />
      </Link>
      <ToastContainer />

      <div className="bg-white shadow-2xl p-8 w-full max-w-6xl rounded-2xl">
        <h2 className="text-[#6D0C0E] text-3xl font-bold text-center mb-6">
          Party Palace Registration
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Please fill out the form below to register your venue. All fields marked with * are required.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleStepClick(num)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                step === num
                  ? "bg-[#6D0C0E] scale-110 shadow-lg"
                  : completedSteps.includes(num)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!completedSteps.includes(num) && num !== Math.max(...completedSteps) + 1}
            >
              {num}
            </button>
          ))}
        </div>

        {step === 1 && <OwnerDetails formData={formData} handleChange={handleChange} />}
        {step === 2 && <VenueDetails formData={formData} handleChange={handleChange} />}
        {step === 3 && <VenueSpace formData={formData} handleChange={handleChange} />}
        {step === 4 && <AdditionalServices formData={formData} handleChange={handleChange} />}
        {step === 5 && (
          <DocumentUpload
            handleImageUpload={handleImageUpload}
            handleFileUpload={handleFileUpload}
            handleRemoveImage={handleRemoveImage}
            formData={formData}
          />
        )}
        {step === 6 && <ReviewSubmit formData={formData} />}

        <div className="flex justify-between mt-8">
          {step > 1 && (
              <button
                onClick={prevStep}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
          )}
          {step < 6 ? (
              <button
                onClick={nextStep}
              className="bg-[#6D0C0E] text-white px-6 py-2 rounded-lg hover:bg-[#8D0C0E] transition-colors ml-auto"
              >
                Next
              </button>
          ) : (
              <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors ml-auto"
            >
              Submit
              </button>
          )}
          </div>
      </div>
    </div>
  );
}
