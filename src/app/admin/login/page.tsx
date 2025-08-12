'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Prevent double redirects
  const redirectedRef = useRef(false);

  // Check if user is already logged in (prefer localStorage token then cookie)
  useEffect(() => {
    const checkAuth = async () => {
      if (redirectedRef.current) return;
      try {
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : null;
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          headers: localToken ? { 'Authorization': `Bearer ${localToken}` } : undefined,
          credentials: 'include'
        });
        if (response.ok) {
          redirectedRef.current = true;
            router.replace('/admin/dashboard');
        }
      } catch (_) {
        // ignore
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  if (isLoading) return; // guard against rapid double submit
  setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error || 'Login failed');
        return;
      }

      const data = await response.json();
      console.log('Login - Response data:', data);
      toast.success('Login successful!');

      // Store token in localStorage
      if (data.token) {
        try {
          localStorage.setItem('admin-token', data.token);
          console.log('Login - Token stored');
        } catch (err) {
          console.warn('Login - Failed to store token:', err);
        }
      }

      // Immediately verify before redirect to ensure subsequent page passes auth check
      try {
        const verifyRes = await fetch('/api/admin/verify', {
          method: 'GET',
            headers: data.token ? { 'Authorization': `Bearer ${data.token}` } : undefined,
          credentials: 'include'
        });
        console.log('Login - Verify after auth status:', verifyRes.status);
        if (!verifyRes.ok) {
          const vr = await verifyRes.json().catch(() => ({}));
          toast.error('Verification failed: ' + (vr.error || verifyRes.status));
          return;
        }
      } catch (err) {
        console.error('Login - Post-login verify threw error:', err);
        toast.error('Post-login verification failed');
        return;
      }

      if (!redirectedRef.current) {
        redirectedRef.current = true;
        console.log('Login - Redirecting to dashboard');
        router.replace('/admin/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-sm sm:text-base text-gray-600">Access the hotel management system</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Authorized personnel only</p>
        </div>
      </motion.div>
    </div>
  );
}
