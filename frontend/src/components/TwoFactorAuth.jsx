/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Mail, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function TwoFactorAuth({ 
  tempToken, 
  email, 
  onVerifySuccess, 
  onBack,
  role 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus on the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/verify-otp', {
        otp: otpString,
        tempToken
      });

      setSuccess('Verification successful! Logging you in...');
      
      // Store token and user info
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setTimeout(() => {
        onVerifySuccess(response.data.user);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/resend-otp', { tempToken });
      setSuccess('New verification code sent to your email!');
      setCountdown(30);
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const getRoleInfo = () => {
    const roles = {
      super_admin: { name: 'Super Admin', color: 'indigo' },
      branch_admin: { name: 'Branch Admin', color: 'emerald' },
      doctor: { name: 'Doctor', color: 'teal' },
      staff: { name: 'Clinical Staff', color: 'sky' },
      staff_admin: { name: 'Staff Admin', color: 'blue' },
      patient: { name: 'Patient', color: 'rose' }
    };
    return roles[role] || { name: 'User', color: 'slate' };
  };

  const roleInfo = getRoleInfo();
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    teal: 'text-teal-600 bg-teal-50 border-teal-200',
    sky: 'text-sky-600 bg-sky-50 border-sky-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    slate: 'text-slate-600 bg-slate-50 border-slate-200'
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white block shadow-sm">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-white leading-tight">
              Two-Factor Authentication
            </h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 bg-slate-50/50">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </button>

        {/* Role Badge */}
        <div className="text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClasses[roleInfo.color]}`}>
            {roleInfo.name} Portal
          </span>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <h3 className="text-sm font-black text-slate-850">
            Verify Your Identity
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            We've sent a 6-digit verification code to<br/>
            <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{success}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.some(d => !d)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Verify & Continue
              </>
            )}
          </button>
        </form>

        {/* Resend Code */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-[11px] text-slate-500">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || resending}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {countdown > 0 
              ? `Resend in ${countdown}s` 
              : resending 
                ? 'Sending...' 
                : 'Resend Code'
            }
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 leading-relaxed">
              For your security, the verification code expires in 5 minutes. 
              Never share this code with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}