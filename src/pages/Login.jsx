import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Login({ onLogin }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Email / Gmail address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.auth.sendOtp({ email: cleanEmail });
      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
      setSuccessMsg(res.message || `OTP sent to ${cleanEmail}`);
    } catch (err) {
      console.error('Failed to send OTP:', err);
      setError(err.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the OTP sent to your email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });

      if (res.token) {
        localStorage.setItem('raithu_auth_token', res.token);
      }
      if (res.user) {
        localStorage.setItem('raithu_user_profile', JSON.stringify(res.user));
        if (onLogin) onLogin(res.user);
      }
      navigate('/profile');
    } catch (err) {
      console.error('OTP Verification failed:', err);
      setError(err.message || 'Invalid OTP. Please enter the correct code from your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl shadow-gray-200/50 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-green-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-36 h-36 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-green-600/30">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t('login_title')}
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {t('login_desc')}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5 text-green-800 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email & Mobile Number */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email-input" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('login_email_label')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4 text-gray-500" />
                </span>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login_email_placeholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Mobile Number Field — coming soon, disabled */}
            <div>
              <label htmlFor="mobile-input" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('mobile_label')}
                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded normal-case tracking-normal">Coming soon</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300">
                  +91
                </span>
                <input
                  id="mobile-input"
                  type="tel"
                  disabled
                  placeholder={t('mobile_placeholder')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 pl-1">Mobile OTP login will be available soon. Please use Email to continue.</p>
            </div>

            {/* Submit / Continue Button */}
            <button
              type="submit"
              disabled={loading || !email.includes('@')}
              className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>{t('btn_continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter & Verify OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
            <div className="p-3.5 bg-green-50/80 border border-green-100 rounded-2xl text-xs text-green-900 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-2">
                <Mail className="w-4 h-4 text-green-700 shrink-0" />
                <span className="truncate">
                  {t('otp_sent_to')} <strong className="text-green-950">{email}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError(null);
                }}
                className="text-green-700 hover:text-green-800 font-bold underline shrink-0 cursor-pointer"
              >
                Change
              </button>
            </div>

            <div>
              <label htmlFor="otp-input" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                {t('enter_otp_label')}
              </label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-2xl py-3 rounded-xl border border-gray-300 font-mono font-bold text-green-800 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
              />
            </div>

            {/* Resend OTP button & timer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-green-700 hover:text-green-800 font-bold underline cursor-pointer"
                >
                  {t('btn_resend_otp')}
                </button>
              ) : (
                <span>
                  {t('resend_otp_in')} <strong className="text-gray-700">{timer}s</strong>
                </span>
              )}
              <span className="text-[11px] text-gray-400">Valid for 10 minutes</span>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code & Logging in...</span>
                </>
              ) : (
                <span>{t('btn_verify_login')}</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="pt-2 text-center border-t border-gray-100">
          <Link to="/" className="text-xs text-gray-400 hover:text-green-600 transition-colors">
            {t('btn_continue_guest')}
          </Link>
        </div>

      </div>
    </div>
  );
}


