'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
  FaEnvelope, FaLock, FaGoogle, FaArrowLeft, FaUser, FaIdBadge, FaCheckCircle
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterOwnerPage() {
  const { data: session, status } = useSession();

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'owner') {
      window.location.href = '/';
    }
  }, [session]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setShowTermsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!termsAccepted) {
      setShowTermsError(true);
      setError('Please accept the terms and conditions to register');
      setLoading(false);
      return;
    }

    const { firstName, lastName, username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Register the owner account
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password,
        role: 'owner',
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        isActive: true // Set owner account as active immediately
      });

      if (response.data.success) {
        // Login immediately after registration
        try {
          const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
          });

          if (loginResponse.data.success) {
            // Store the token
            localStorage.setItem('token', loginResponse.data.token);
            
            // Sign in using NextAuth
            const result = await signIn('credentials', {
              redirect: false,
              email,
              password,
              callbackUrl: '/'
            });

            if (result?.ok) {
              // Redirect to home page
              window.location.href = '/';
            } else {
              setError('Registration successful but login failed. Please try logging in manually.');
            }
          } else {
            setError('Registration successful but login failed. Please try logging in manually.');
          }
        } catch (loginError) {
          console.error('Login error:', loginError);
          setError('Registration successful but login failed. Please try logging in manually.');
        }
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
    setShowTermsError(false);
    setError('');
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
      {/* Image Section */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/Image/cs.png"
          alt="Register Illustration"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col p-6">
        <Link href="/" className="text-gray-600 hover:text-gray-800 self-start mb-4 text-sm">
          <FaArrowLeft className="inline-block mr-1" />
          Back
        </Link>

        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-[#7a1313] text-center">
            Create Owner Account
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Owner First Name"
                name="firstName"
                icon={<FaUser />}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Shreeju"
              />
              <InputField
                label="Owner Last Name"
                name="lastName"
                icon={<FaUser />}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Thapa"
              />
            </div>

            <InputField
              label="Venue Name"
              name="username"
              icon={<FaIdBadge />}
              value={formData.username}
              onChange={handleChange}
              placeholder="Royal Banquet"
              minLength={3}
              maxLength={50}
            />

            <InputField
              label="Venue Email Address"
              name="email"
              type="email"
              icon={<FaEnvelope />}
              value={formData.email}
              onChange={handleChange}
              placeholder="Royal.Banquet@example.com"
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Password"
                name="password"
                type="password"
                icon={<FaLock />}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={<FaLock />}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="w-4 h-4 text-[#7a1313] border-gray-300 rounded focus:ring-[#7a1313]"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-[#7a1313] hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7a1313] hover:bg-[#5a0e0e] text-white py-2.5 px-4 rounded-lg text-base font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Registering...' : (
                <>
                  <FaCheckCircle />
                  Register
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-3 text-[0.7rem] text-gray-500">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/privacy-policy" className="text-[#7a1313] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔧 Reusable Input Field Component
function InputField({
  label,
  name,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  minLength,
  maxLength
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          required
          className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
        />
      </div>
    </div>
  );
}
