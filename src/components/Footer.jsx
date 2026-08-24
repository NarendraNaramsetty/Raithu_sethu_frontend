import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Heart, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white shadow-sm shadow-green-600/30">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Raithu<span className="text-green-600">Setu</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              {t('footer_services')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/disease-detection" className="hover:text-green-600 transition-colors">{t('nav_disease')}</Link></li>
              <li><Link to="/market-prices" className="hover:text-green-600 transition-colors">{t('nav_market')}</Link></li>
              <li><Link to="/govt-schemes" className="hover:text-green-600 transition-colors">{t('nav_schemes')}</Link></li>
              <li><Link to="/weather" className="hover:text-green-600 transition-colors">{t('nav_weather')}</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              {t('footer_support')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/community" className="hover:text-green-600 transition-colors">{t('community_title')}</Link></li>
              <li><Link to="/community" className="hover:text-green-600 transition-colors">{t('rental_spotlight_title')}</Link></li>
              <li><Link to="/profile" className="hover:text-green-600 transition-colors">{t('profile_land_title')}</Link></li>
            </ul>
          </div>

          {/* Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {t('footer_helpline')}
            </h4>
            <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-green-800 font-semibold">
                <Phone className="w-3.5 h-3.5" />
                <span>{t('footer_toll_free')}</span>
              </div>
              <p className="text-gray-500 text-[11px]">{t('footer_langs')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} {t('footer_copyright')}</p>
          <p className="flex items-center gap-1">
            {t('footer_built_with')} <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
