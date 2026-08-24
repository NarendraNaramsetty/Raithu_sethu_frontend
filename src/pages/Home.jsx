import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  TrendingUp,
  Landmark,
  CloudSun,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ isLoggedIn, setIsLoggedIn }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section
        className="relative overflow-hidden bg-cover bg-right sm:bg-center py-12 lg:py-20 border-b border-gray-100"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.4) 100%), url('/hero-bg.jpg')`,
        }}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100/90 text-green-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                {t('hero_badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {t('hero_title_1')} <span className="text-green-600">{t('hero_title_2')}</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                {t('hero_desc')}
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link
                  to="/disease-detection"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 active:bg-green-800 shadow-md shadow-green-600/30 transition-all"
                >
                  <ScanLine className="w-4 h-4" />
                  {t('btn_try_disease')}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/market-prices"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-sm border border-gray-200 hover:bg-green-50/70 hover:border-green-300 transition-all"
                >
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  {t('btn_check_mandi')}
                </Link>
              </div>
            </div>

            {/* Quick Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/disease-detection"
                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <ScanLine className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {t('card_ai_title')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('card_ai_desc')}
                </p>
              </Link>

              <Link
                to="/market-prices"
                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {t('card_mandi_title')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('card_mandi_desc')}
                </p>
              </Link>

              <Link
                to="/govt-schemes"
                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {t('card_schemes_title')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('card_schemes_desc')}
                </p>
              </Link>

              <Link
                to="/weather"
                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <CloudSun className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {t('card_weather_title')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('card_weather_desc')}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
