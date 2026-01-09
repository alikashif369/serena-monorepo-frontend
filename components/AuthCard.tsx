'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#F9F8F6] relative overflow-hidden p-4">
      {/* Subtle Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-green-950/[0.03] -skew-y-6 transform -translate-y-24 z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-96 bg-serena-gold/[0.03] skew-y-6 transform translate-y-24 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl z-10 overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Image
              src="/serena-logo.png"
              alt="Serena Green"
              width={64}
              height={64}
              className="mx-auto mb-5"
            />
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-[1px] w-6 bg-serena-gold" />
              <span className="text-serena-gold text-[10px] font-bold uppercase tracking-[0.2em]">
                Admin Portal
              </span>
              <div className="h-[1px] w-6 bg-serena-gold" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-green-950 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-xs rounded-r-md"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-green-950 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-gray-400 group-focus-within:text-serena-gold transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-green-950 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-950/10 focus:border-green-950 transition-all disabled:opacity-50"
                  placeholder="admin@serenahotels.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-green-950 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-serena-gold transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-green-950 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-950/10 focus:border-green-950 transition-all disabled:opacity-50"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-950 text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-950 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">
            <p className="text-[10px] text-center text-gray-400 mb-4 px-4 leading-relaxed">
              This system is for authorized administrators only. Unauthorized access is prohibited and may be monitored.
            </p>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-950 transition-colors group">
              <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
