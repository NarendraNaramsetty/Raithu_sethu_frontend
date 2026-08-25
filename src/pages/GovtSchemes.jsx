import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  BadgeCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function GovtSchemes() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchemes = async (cat = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.schemes.getAll(cat === 'all' ? '' : cat);
      setSchemes(data);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
      setError('Could not load government schemes. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(category);
  }, [category]);

  const categoryTabs = [
    { key: 'all', label: t('tab_all') },
    { key: 'Central Scheme', label: t('tab_central') },
    { key: 'Crop Insurance', label: t('tab_insurance') },
    { key: 'Low Interest Loan', label: t('tab_loan') },
    { key: 'Solar', label: t('tab_solar') },
  ];

  return (
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <BadgeCheck className="w-3.5 h-3.5 text-amber-700" />
          {t('schemes_badge')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {t('schemes_title')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('schemes_desc')}
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCategory(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                category === tab.key
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Schemes Grid */}
      {loading ? (
        <PageLoader variant="cards" label={t('schemes_loading')} count={4} />
      ) : schemes.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
          No schemes found in this category.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-green-200 transition-all space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold">
                    {scheme.tag}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {scheme.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 leading-snug">
                  {scheme.title}
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {scheme.subtitle}
                </p>

                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[11px] text-green-800 font-semibold uppercase tracking-wider">{t('scheme_benefit_label')}</p>
                  <p className="text-base font-extrabold text-green-900">{scheme.benefit}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-bold text-gray-800">{t('scheme_eligibility_label')}</p>
                  <p className="text-xs text-gray-500">{scheme.eligibility}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-800">{t('scheme_docs_label')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(scheme.documents || []).map((doc, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {t('btn_apply_portal')}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
