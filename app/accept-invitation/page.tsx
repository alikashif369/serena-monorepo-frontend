'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [tokenError, setTokenError] = useState('');

  // Password validation states
  const hasMinLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&#^()_+=\-\[\]{}|;:',.<>\/~`]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    if (!token) {
      setTokenError('No invitation token provided');
      setIsLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-invitation/${token}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid or expired invitation');
      }

      const data = await response.json();
      setEmail(data.email);
    } catch (err: any) {
      setTokenError(err.message || 'Invalid invitation link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{}|;:',.<>\/~`])[A-Za-z\d@$!%*?&#^()_+=\-\[\]{}|;:',.<>\/~`]{12,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/accept-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: name.trim(), password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create account');
      }

      setIsComplete(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen w-full flex items-center justify-center bg-[#F9F8F6] relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 w-full h-96 bg-green-950/[0.03] -skew-y-6 transform -translate-y-24 z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-serena-gold/[0.03] skew-y-6 transform translate-y-24 z-0 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-950 border-t-transparent mx-auto mb-4"></div>
            <p className="text-green-950 text-sm font-medium">Verifying invitation...</p>
        </div>
      </section>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <section className="min-h-screen w-full flex items-center justify-center bg-[#F9F8F6] relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 w-full h-96 bg-green-950/[0.03] -skew-y-6 transform -translate-y-24 z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-serena-gold/[0.03] skew-y-6 transform translate-y-24 z-0 pointer-events-none" />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100"
        >
            <Image src="/serena-logo.png" alt="Serena Green" width={48} height={48} className="mx-auto mb-6" />
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
              <FaExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-green-950 mb-3">Invalid Invitation</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{tokenError}</p>
            
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-green-950 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Homepage
            </Link>
        </motion.div>
      </section>
    );
  }

  // Success state
  if (isComplete) {
    return (
      <section className="min-h-screen w-full flex items-center justify-center bg-[#F9F8F6] relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 w-full h-96 bg-green-950/[0.03] -skew-y-6 transform -translate-y-24 z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-96 bg-serena-gold/[0.03] skew-y-6 transform translate-y-24 z-0 pointer-events-none" />

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100"
        >
            <Image src="/serena-logo.png" alt="Serena Green" width={48} height={48} className="mx-auto mb-6" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center"
            >
              <FaCheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <h2 className="text-xl font-serif font-bold text-green-950 mb-2">Account Created!</h2>
            <p className="text-gray-500 text-sm mb-6">Your admin account has been set up successfully.</p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 text-xs font-medium rounded-full">
               <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay }}
                      className="w-1.5 h-1.5 rounded-full bg-green-600"
                    />
                  ))}
               </div>
               Redirecting to login...
            </div>
        </motion.div>
      </section>
    );
  }

  // Form state
  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#F9F8F6] relative overflow-hidden p-6">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-green-950/[0.03] -skew-y-6 transform -translate-y-24 z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-96 bg-serena-gold/[0.03] skew-y-6 transform translate-y-24 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <Image src="/serena-logo.png" alt="Serena Green" width={64} height={64} className="mx-auto mb-5" />
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-[1px] w-6 bg-serena-gold" />
              <span className="text-serena-gold text-[10px] font-bold uppercase tracking-[0.2em]">
                Welcome
              </span>
              <div className="h-[1px] w-6 bg-serena-gold" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-green-950 mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm">Set up your admin credentials</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-green-950 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed font-medium"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-green-950 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400 group-focus-within:text-serena-gold transition-colors" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-green-950 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-950/10 focus:border-green-950 transition-all"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-green-950 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-serena-gold transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={12}
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-green-950 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-950/10 focus:border-green-950 transition-all"
                  placeholder="Min 12 characters"
                />
              </div>
              {/* Compact password requirements */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { ok: hasMinLength, label: '12+ chars' },
                  { ok: hasUpperCase, label: 'A-Z' },
                  { ok: hasLowerCase, label: 'a-z' },
                  { ok: hasNumber, label: '0-9' },
                  { ok: hasSpecialChar, label: '!@#$' },
                  { ok: passwordsMatch, label: 'Match' },
                ].map((req, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-[10px] font-medium ${req.ok ? 'text-green-600' : 'text-gray-400'}`}>
                    {req.ok ? <FaCheck className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-green-950 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-serena-gold transition-colors" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-green-950 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-950/10 focus:border-green-950 transition-all"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-green-950 text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-950 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FaArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-950 transition-colors group">
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

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <section className="h-screen flex overflow-hidden">
          <div className="hidden lg:block lg:w-1/2 bg-green-950" />
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F9F8F6]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-950 border-t-transparent" />
          </div>
        </section>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
