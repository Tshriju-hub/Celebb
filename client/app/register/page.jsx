'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaEnvelope, FaLock, FaGoogle, FaArrowLeft, FaUser, FaIdBadge } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
  
      if (response.data.success) {
        setSuccess('Successfully registered!');
        setTimeout(() => setSuccess(''), 1000); // Hide message after 3s
        setTimeout(() => {
          router.push('/'); // Redirect to dashboard after 2 seconds
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/user/dashboard' });
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to login with Google');
    }
  };


  return (
    <div className="min-h-screen bg-white flex">
    {success && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white text-green-700 font-bold py-3 px-6 rounded-lg shadow-lg">
      {success}
    </div>
  </div>
)}

      {/* Image Section */}
      <div className="hidden lg:block w-1/2 relative">
        <Image 
          src="/Image/cs.png" 
          alt="Register Illustration"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col p-6">
        {/* Back Button */}
        <Link href="/" className="text-gray-600 hover:text-gray-800 self-start mb-4 text-sm">
          <FaArrowLeft className="inline-block mr-1" />
          Back
        </Link>

        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-[#7a1313] text-center">
            Create Account
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Shreeju"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder=" Thapa"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Username</label>
              <div className="relative">
                <FaIdBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="username"
                    placeholder=" ShreejuThapa123"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                    value={formData.username}
                    onChange={handleChange}
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9]+"
                    title="Username must be 3-20 characters long and contain only letters and numbers"
                    required
                  />

                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Shreeju.Thapa@example.com"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="password"
                      name="password"
                      placeholder="At least 8 characters"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Confirm Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat your password"
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#7a1313] hover:bg-[#5a0e0e] text-white py-2.5 px-4 rounded-lg text-base font-bold transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 border-t border-gray-300"></div>
              <span className="relative bg-white px-2 text-gray-500 text-sm">OR</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
            >
              <FaGoogle className="text-red-500" />
              Continue with Google
            </button>

            <div className="text-center space-y-3">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#7a1313] hover:underline">
                  Log in here
                </Link>
              </p>
              <p className="text-[0.7rem] text-gray-500">
                By continuing, you agree to our{' '}
                <Link href="/privacy-policy" className="text-[#7a1313] hover:underline">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-[#7a1313] hover:underline">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
