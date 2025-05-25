'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaGoogle, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    
    if (error === 'venue_rejected') {
      toast.error("Your venue registration has been rejected. Your account has been permanently suspended.");
    }
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Use NextAuth's signIn function for credentials login
    console.log('Attempting to login with:', { email, password });
    const res = await signIn('credentials', {
      redirect: false, // Don't redirect automatically, we'll handle the navigation manually
      email,
      password,
    });
    if (res.ok) {
      const session = await getSession(); // or useSession() if inside a component
      localStorage.setItem('token', session?.user?.token); // Store token in local storage
    }

    if (res?.error) {
      console.error(res); // Log error for debugging
      setError(res.error); // Display error message if login fails
    } else {
      router.push('/'); // Redirect to home on successful login
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch {
      setError('Failed to login with Google.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Image Section */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/Image/cs.png"
          alt="Login Illustration"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col p-6">
        {/* Back Button */}
        <Link href="/" className="text-gray-600 hover:text-gray-800 self-start mb-4 text-sm flex items-center">
          <FaArrowLeft className="mr-2" /> Back
        </Link>

        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-[#7a1313] text-center">Login</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="password"
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7a1313] focus:border-[#7a1313] outline-none transition-all duration-300 hover:shadow-md"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#7a1313] hover:bg-[#5a0e0e] text-white py-2.5 px-4 rounded-lg text-base font-bold transition-all duration-300 transform hover:scale-105"
              >
                Login
              </button>

              {/* OR Separator */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 border-t border-gray-300"></div>
                <span className="relative bg-white px-2 text-gray-500 text-sm">OR</span>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
              >
                <FaGoogle className="text-red-500" />
                Continue with Google
              </button>

              {/* Sign Up & Terms */}
              <div className="text-center space-y-3">
                <p className="text-xs text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-[#7a1313] hover:underline">
                    Register here
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
          </form>
        </div>
      </div>
    </div>
  );
}
