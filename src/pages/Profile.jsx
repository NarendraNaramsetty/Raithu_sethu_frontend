import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  Bell,
  Settings,
  Sparkles,
  TrendingUp,
  Landmark,
  CloudSun,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Save,
  Globe,
  Info,
  AlertTriangle,
  Bug,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function Profile({ user, onLogout }) {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'overview' | 'alerts' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!user && Boolean(localStorage.getItem('raithu_auth_token')));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Settings form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    village: '',
    district: '',
    state: ''
  });

  // Notification toggles
  const [notifs, setNotifs] = useState({
    mandiAlerts: true,
    weatherAlerts: true,
    schemeUpdates: true,
    emailAdvisories: true
  });

  // Sync tab with URL hash (#alerts, #settings, #overview)
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (hash === 'alerts') {
      setActiveTab('alerts');
    } else if (hash === 'settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [location.hash]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.auth.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        village: data.village || '',
        district: data.district || '',
        state: data.state || ''
      });
      localStorage.setItem('raithu_user_profile', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to load profile:', err);
      const cached = localStorage.getItem('raithu_user_profile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
          setFormData({
            name: parsed.name || '',
            phone: parsed.phone || '',
            email: parsed.email || '',
            village: parsed.village || '',
            district: parsed.district || '',
            state: parsed.state || ''
          });
        } catch {
          setError('Could not load profile from database.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('raithu_auth_token');
    if (token) {
      fetchProfile();
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSuccessMsg(null);
    setError(null);
    window.location.hash = tab === 'overview' ? '' : tab;
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await api.auth.updateProfile(formData);
      setProfile(updated);
      localStorage.setItem('raithu_user_profile', JSON.stringify(updated));
      setSuccessMsg(t('save_success') || 'Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('raithu_auth_token');
      localStorage.removeItem('raithu_user_profile');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600" />
        <p className="text-sm font-medium">Loading farmer profile...</p>
      </div>
    );
  }

  if (!profile && !localStorage.getItem('raithu_auth_token')) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t('login_title')}</h1>
          <p className="text-sm text-gray-500">
            Please sign in to access your farmer profile, alerts, and settings.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
        >
          {t('btn_continue')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const currentProfile = profile || {
    name: 'Farmer Member',
    email: 'farmer@gmail.com',
    phone: '+91 98765 43210',
    village: 'Pedakakani',
    district: 'Guntur',
    state: 'Andhra Pradesh'
  };

  const initialLetter = (currentProfile.name || currentProfile.email || 'F').charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Alert Notices */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-green-800 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Profile Header Bar */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-green-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shadow-green-600/20 shrink-0">
            {initialLetter}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {currentProfile.name || 'Farmer Member'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Verified Farmer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{currentProfile.village ? `${currentProfile.village}, ` : ''}{currentProfile.district || 'Guntur'}, {currentProfile.state || 'Andhra Pradesh'}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-200/60 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav_logout')}</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('profile_tab_overview')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('alerts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
            activeTab === 'alerts'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t('profile_tab_alerts')}</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t('profile_tab_settings')}</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. OVERVIEW (MY PROFILE) */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Account Details Card */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <Mail className="w-4 h-4 text-green-600" />
                <span>Verified Email Address</span>
              </div>
              <p className="text-base font-bold text-gray-900 truncate">
                {currentProfile.email || 'Not provided'}
              </p>
              <p className="text-[11px] text-green-600 font-medium">OTP Verification Enabled</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <Phone className="w-4 h-4 text-green-600" />
                <span>Registered Mobile Number</span>
              </div>
              <p className="text-base font-bold text-gray-900">
                {currentProfile.phone || '+91 98765 43210'}
              </p>
              <p className="text-[11px] text-gray-400">Primary contact for Mandi & SMS updates</p>
            </div>
          </div>

          {/* Quick Services Navigation */}
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider px-1">
              Quick Access & Services
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <Link
                to="/disease-detection"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    AI Crop Doctor
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Scan plant leaf & get disease remedies
                  </p>
                </div>
              </Link>

              <Link
                to="/market-prices"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Market Prices
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Check daily APMC mandi rates
                  </p>
                </div>
              </Link>

              <Link
                to="/schemes"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                    Govt Schemes
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Direct benefits & subsidy portals
                  </p>
                </div>
              </Link>

              <Link
                to="/weather"
                className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    Farm Weather
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    7-Day forecast & spray advisories
                  </p>
                </div>
              </Link>

            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. ALERTS & ADVISORY */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Live Regional Farming Advisories ({currentProfile.district || 'Guntur'})
            </h2>
            <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live Updates
            </span>
          </div>

          <div className="grid gap-4">
            
            {/* Weather Alert */}
            <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    Weather Advisory: Moderate Rainfall in 36-48 Hours
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  IMD forecasts cloudy skies with scattered thundershowers across {currentProfile.district || 'Guntur'} region. Farmers are advised to postpone fertilizer top-dressing and chemical sprayings on Cotton and Chilli fields until rains clear.
                </p>
                <div className="pt-1 flex items-center gap-4 text-[11px] text-amber-700 font-medium">
                  <Link to="/weather" className="underline hover:text-amber-950 font-bold">
                    View 7-Day Forecast →
                  </Link>
                </div>
              </div>
            </div>

            {/* Mandi Price Alert */}
            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-emerald-950">
                    Mandi Alert: Red Chilli Prices Surged by ₹450/qtl
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    Market Opportunity
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Active trading in Guntur APMC Market Yard today. Teja Red Chilli modal rate touched ₹18,650/quintal due to strong export demand.
                </p>
                <div className="pt-1 flex items-center gap-4 text-[11px] text-emerald-700 font-medium">
                  <Link to="/market-prices" className="underline hover:text-emerald-950 font-bold">
                    Check All APMC Rates →
                  </Link>
                </div>
              </div>
            </div>

            {/* Pest Advisory */}
            <div className="p-5 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Bug className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-orange-950">
                    Pest Alert: Fall Armyworm & Sucking Pest Warning
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-200 text-orange-900">
                    Precautionary
                  </span>
                </div>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Inspect leaf undersides in Maize and young Cotton crops for thrips and early larval feeding. Apply organic Neem Oil (5ml/L) as first line of defense.
                </p>
                <div className="pt-1 flex items-center gap-4 text-[11px] text-orange-700 font-medium">
                  <Link to="/disease-detection" className="underline hover:text-orange-950 font-bold">
                    Scan Leaf with AI Crop Doctor →
                  </Link>
                </div>
              </div>
            </div>

            {/* Scheme Alert */}
            <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-blue-950">
                    Scheme Update: PM-KISAN 19th Installment Beneficiary List
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-200 text-blue-900">
                    Government
                  </span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Ensure your Aadhaar is linked to your active bank account to receive the upcoming direct benefit transfer without delays.
                </p>
                <div className="pt-1 flex items-center gap-4 text-[11px] text-blue-700 font-medium">
                  <Link to="/schemes" className="underline hover:text-blue-950 font-bold">
                    View Schemes Portal →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Farmer Information</h2>
              <p className="text-xs text-gray-500">
                Update your farming location and profile details.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="setting-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Farmer Name
                  </label>
                  <input
                    id="setting-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  />
                </div>

                {/* Mobile Phone */}
                <div>
                  <label htmlFor="setting-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    id="setting-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  />
                </div>

                {/* Email (Read only badge) */}
                <div>
                  <label htmlFor="setting-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address (Verified)
                  </label>
                  <input
                    id="setting-email"
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium cursor-not-allowed"
                  />
                </div>

                {/* Village */}
                <div>
                  <label htmlFor="setting-village" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Village / Mandal
                  </label>
                  <input
                    id="setting-village"
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Pedakakani"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  />
                </div>

                {/* District */}
                <div>
                  <label htmlFor="setting-district" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    id="setting-district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Guntur"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="setting-state" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    id="setting-state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Andhra Pradesh"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  />
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-green-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('btn_save_changes')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Language Preferences Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <Globe className="w-5 h-5 text-green-600" />
              <span>Language Preference</span>
            </div>
            <p className="text-xs text-gray-500">
              Select your preferred language for advice, market prices, and disease diagnostics.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    language === l.code
                      ? 'border-green-600 bg-green-50 text-green-950 font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700'
                  }`}
                >
                  <p className="text-sm font-extrabold">{l.native}</p>
                  <p className="text-[11px] text-gray-400 font-normal">{l.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <Bell className="w-5 h-5 text-green-600" />
              <span>Notification Preferences</span>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 cursor-pointer">
                <span className="text-xs font-semibold text-gray-800">
                  Daily APMC Mandi Price Alerts
                </span>
                <input
                  type="checkbox"
                  checked={notifs.mandiAlerts}
                  onChange={(e) => setNotifs({ ...notifs, mandiAlerts: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded accent-green-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 cursor-pointer">
                <span className="text-xs font-semibold text-gray-800">
                  Severe Weather & Rain Advisories
                </span>
                <input
                  type="checkbox"
                  checked={notifs.weatherAlerts}
                  onChange={(e) => setNotifs({ ...notifs, weatherAlerts: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded accent-green-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 cursor-pointer">
                <span className="text-xs font-semibold text-gray-800">
                  Government Scheme & Subsidy Notices
                </span>
                <input
                  type="checkbox"
                  checked={notifs.schemeUpdates}
                  onChange={(e) => setNotifs({ ...notifs, schemeUpdates: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded accent-green-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

