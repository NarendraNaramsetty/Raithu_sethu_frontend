import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { api } from './services/api';

// Modular Pages
import Home from './pages/Home';
import DiseaseDetection from './pages/DiseaseDetection';
import MarketPrices from './pages/MarketPrices';
import GovtSchemes from './pages/GovtSchemes';
import Weather from './pages/Weather';
import Community from './pages/Community';
import Login from './pages/Login';
import Profile from './pages/Profile';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('raithu_auth_token'))
  );
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('raithu_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('raithu_auth_token');
    if (token) {
      setIsLoggedIn(true);
      api.auth
        .getProfile()
        .then((profile) => {
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('raithu_user_profile', JSON.stringify(profile));
          }
        })
        .catch(() => {
          // Keep cached profile if network fails
        });
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('raithu_user_profile', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('raithu_auth_token');
    localStorage.removeItem('raithu_user_profile');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
          {/* Navigation Bar */}
          <Navbar
            isLoggedIn={isLoggedIn}
            user={currentUser}
            onLogout={handleLogout}
          />

          {/* Dynamic Route Pages */}
          <main className="flex-1">
            <Routes>
              <Route
                path="/"
                element={<Home isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/disease-detection"
                element={<DiseaseDetection isLoggedIn={isLoggedIn} />}
              />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="/govt-schemes" element={<GovtSchemes />} />
              <Route path="/weather" element={<Weather />} />
              <Route
                path="/community"
                element={<Community isLoggedIn={isLoggedIn} currentUser={currentUser} />}
              />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route
                path="/profile"
                element={
                  <Profile user={currentUser} onLogout={handleLogout} />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
