'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import api from '@/lib/axios';

// Zod validation schemas
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

const signupSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name cannot be more than 50 characters')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'login') {
      setLoginData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setSignupData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateLoginForm = () => {
    try {
      loginSchema.parse(loginData);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const validateSignupForm = () => {
    try {
      signupSchema.parse(signupData);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Make API call to login endpoint
      const response = await api.post('/user/login', {
        email: loginData.email,
        password: loginData.password
      });

      // Store the auth token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Redirect to home page on successful login
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Login failed. Please try again.';
        setErrors({ general: errorMessage });
      } else if (error.request) {
        // Network error
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        // Other error
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Make API call to signup endpoint
      const response = await api.post('/user/signup', {
        username: signupData.name,
        email: signupData.email,
        password: signupData.password
      });

      // Store the auth token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      // Redirect to home page on successful signup
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Signup failed. Please try again.';
        setErrors({ general: errorMessage });
      } else if (error.request) {
        // Network error
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        // Other error
        setErrors({ general: 'Signup failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to SkillMate
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Connect with others to exchange skills and knowledge
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg p-1">
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'login'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'signup'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Login Card */}
        {activeTab === 'login' && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Sign In</h3>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-500 text-white p-3 rounded-md text-center">
                  {errors.general}
                </div>
              )}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  value={loginData.email}
                  onChange={(e) => handleInputChange(e, 'login')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="login-password"
                    value={loginData.password}
                    onChange={(e) => handleInputChange(e, 'login')}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                    <svg
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.96 9.96 0 011.563-2.037m3.12 3.12A3 3 0 0021 19a2.998 2.998 0 00-.001-5.303" />
                    </svg>
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Signup Card */}
        {activeTab === 'signup' && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Sign Up</h3>
            <form onSubmit={handleSignupSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-500 text-white p-3 rounded-md text-center">
                  {errors.general}
                </div>
              )}
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="signup-name"
                  value={signupData.name}
                  onChange={(e) => handleInputChange(e, 'signup')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="signup-email"
                  value={signupData.email}
                  onChange={(e) => handleInputChange(e, 'signup')}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password"
                    id="signup-password"
                    value={signupData.password}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                    <svg
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.96 9.96 0 011.563-2.037m3.12 3.12A3 3 0 0021 19a2.998 2.998 0 00-.001-5.303" />
                    </svg>
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="signup-confirm-password"
                    value={signupData.confirmPassword}
                    onChange={(e) => handleInputChange(e, 'signup')}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                    <svg
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.96 9.96 0 011.563-2.037m3.12 3.12A3 3 0 0021 19a2.998 2.998 0 00-.001-5.303" />
                    </svg>
                  </span>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 