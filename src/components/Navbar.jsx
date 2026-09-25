import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Sprout,
  Home,
  ScanLine,
  TrendingUp,
  Landmark,
  CloudSun,
  Users,
  Globe,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  Check,
  Sparkles
} from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function Navbar({
  isLoggedIn = false,
  user,
  onLogin,
  onLogout,
}) {
  const { language, setLanguage, t, activeLangObj } = useLanguage();

  const profileUser = user || {
    name: 'Farmer',
    phone: '',
    avatar: null,
  };

  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();

  // Refs for outside click detection
  const langDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navLinks = [
    { name: t('nav_home'), path: '/', icon: Home },
    { name: t('nav_disease'), path: '/disease-detection', icon: ScanLine, badge: 'AI' },
    { name: t('nav_market'), path: '/market-prices', icon: TrendingUp },
    { name: t('nav_schemes'), path: '/govt-schemes', icon: Landmark },
    { name: t('nav_weather'), path: '/weather', icon: CloudSun },
    { name: t('nav_community'), path: '/community', icon: Users },
  ];

  // Close all open dropdowns/menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLangDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Handle scroll detection for dynamic shadow/border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target)
      ) {
        setIsLangDropdownOpen(false);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLangDropdownOpen(false);
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang.code);
    setIsLangDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        isScrolled
          ? 'shadow-md border-b border-gray-200/80 bg-white/95 backdrop-blur-md'
          : 'border-b border-gray-100'
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          
          {/* 1. LEFT: LOGO & BRAND */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-lg p-1 shrink-0"
            aria-label="RaithuSetu Home"
          >
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-600/20 group-hover:bg-green-700 transition-colors duration-200 shrink-0">
              <Sprout className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div className="flex flex-col shrink-0">
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 leading-tight flex items-center gap-1.5">
                Raithu<span className="text-green-600">Setu</span>
              </span>
              <span className="text-[11px] font-medium text-gray-500 -mt-0.5 tracking-wide">
                {t('brand_subtitle')}
              </span>
            </div>
          </Link>

          {/* 2. CENTER: DESKTOP NAVIGATION LINKS */}
          <nav
            className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 2xl:gap-3 shrink-0"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2 px-3 py-2 xl:px-3.5 xl:py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                      isActive
                        ? 'bg-green-600 text-white shadow-sm shadow-green-600/30'
                        : 'text-gray-700 hover:text-green-700 hover:bg-green-50/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-green-600 group-hover:text-green-700'
                        }`}
                      />
                      <span className="whitespace-nowrap">{link.name}</span>
                      
                      {link.badge && (
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                            isActive
                              ? 'bg-white/20 text-white ring-1 ring-white/30'
                              : 'bg-green-600 text-white shadow-xs'
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 3. RIGHT: ACTIONS (Language + Login/Profile) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            
            {/* Language Selector Dropdown */}
            <div className="relative shrink-0" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                aria-expanded={isLangDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select Language"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50/80 border border-gray-200 hover:border-green-300 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 whitespace-nowrap shrink-0"
              >
                <Globe className="w-4 h-4 text-green-600" />
                <span>{activeLangObj.native}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                    isLangDropdownOpen ? 'rotate-180 text-green-600' : ''
                  }`}
                />
              </button>

              {/* Language Dropdown Menu */}
              {isLangDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    {t('nav_select_lang')}
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      role="option"
                      aria-selected={language === lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors duration-150 ${
                        language === lang.code
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{lang.native}</span>
                        <span className="text-[11px] text-gray-400 font-normal">{lang.label}</span>
                      </div>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth State: Profile Menu OR Login Button */}
            {isLoggedIn ? (
              <div className="relative shrink-0" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="menu"
                  aria-label="User profile menu"
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                >
                  {profileUser.avatar ? (
                    <img
                      src={profileUser.avatar}
                      alt={profileUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-green-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm">
                      {profileUser.name ? profileUser.name.charAt(0) : <User className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {(profileUser.name || '').split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180 text-green-600' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profileUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{profileUser.phone}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        {t('nav_my_profile')}
                      </Link>
                      <Link
                        to="/profile#alerts"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Bell className="w-4 h-4 text-gray-400" />
                        {t('nav_alerts')}
                      </Link>
                      <Link
                        to="/profile#settings"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        {t('nav_settings')}
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={onLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav_logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-sm shadow-green-600/30 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  {t('nav_login')}
                </Link>
              </div>
            )}
          </div>

          {/* 4. MOBILE HAMBURGER BUTTON */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5 text-green-600" />
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-controls="mobile-menu"
              className="p-2 rounded-lg text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-800" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 5. MOBILE SLIDE-DOWN DRAWER */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="lg:hidden border-t border-gray-100 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 animate-in slide-in-from-top-4"
        >
          {isLoggedIn ? (
            <div className="flex items-center justify-between p-3 bg-green-50/80 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                {profileUser.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt={profileUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-base">
                    {profileUser.name ? profileUser.name.charAt(0) : <User className="w-5 h-5" />}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{profileUser.name}</p>
                  <p className="text-xs text-gray-500">{profileUser.phone}</p>
                </div>
              </div>
              <Link
                to="/profile"
                className="text-xs font-semibold text-green-700 hover:underline px-2 py-1"
              >
                View
              </Link>
            </div>
          ) : (
            <div className="p-3 bg-green-50/60 rounded-xl border border-green-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">{t('nav_join_community')}</p>
                <p className="text-sm font-bold text-gray-900">{t('nav_custom_advice')}</p>
              </div>
              <Link
                to="/login"
                onClick={onLogin}
                className="px-3.5 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-green-700"
              >
                {t('nav_login')}
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t('nav_menu')}
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-green-600 text-white font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white">
                          <Sparkles className="w-2.5 h-2.5" />
                          {link.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Language Selection in Mobile Menu */}
          <div className="pt-2 border-t border-gray-100">
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {t('nav_select_lang')}
            </p>
            <div className="grid grid-cols-3 gap-2 px-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`py-2 px-2 rounded-xl text-center text-xs font-medium border transition-all ${
                    language === lang.code
                      ? 'bg-green-50 text-green-700 border-green-600 font-bold shadow-xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <p className="leading-none">{lang.native}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{lang.label}</p>
                </button>
              ))}
            </div>
          </div>

          {isLoggedIn && (
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link
                to="/profile#settings"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                {t('nav_settings')}
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                {t('nav_logout')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
