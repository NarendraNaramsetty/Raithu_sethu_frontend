import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Radio,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function MarketPrices() {
  const { t, language } = useLanguage();
  const [mandiData, setMandiData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ states: [], commodities: [] });
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCommodity, setSelectedCommodity] = useState('All Commodities');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState('data.gov.in (Official Govt API)');
  const [isLiveApi, setIsLiveApi] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load filter options on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await api.mandi.getFilters();
        if (filters && filters.states && filters.commodities) {
          setFilterOptions(filters);
        }
      } catch (err) {
        console.warn('Could not load dynamic filters, using defaults:', err);
      }
    }
    loadFilters();
  }, []);

  // Fetch prices based on active filters
  const fetchPrices = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {};
      if (selectedState && selectedState !== 'All States') {
        params.state = selectedState;
      }
      if (selectedCommodity && selectedCommodity !== 'All Commodities') {
        params.commodity = selectedCommodity;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (forceRefresh) {
        params.refresh = 'true';
      }

      const [pricesRes, summaryRes] = await Promise.allSettled([
        api.mandi.getPrices(params),
        api.mandi.getSummary(selectedState !== 'All States' ? selectedState : undefined),
      ]);

      if (pricesRes.status === 'fulfilled') {
        const responseData = pricesRes.value;
        const items = Array.isArray(responseData) ? responseData : (responseData?.results || []);
        setMandiData(items);
        if (responseData?.source) setDataSource(responseData.source);
        if (responseData?.is_live !== undefined) setIsLiveApi(Boolean(responseData.is_live));
      } else {
        throw pricesRes.reason;
      }

      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummaryData(summaryRes.value);
      }
    } catch (err) {
      console.error('Failed to fetch mandi prices:', err);
      setError('Unable to load live mandi rates. Ensure the backend server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounce search and filter updates
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPrices(false);
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedState, selectedCommodity]);

  const handleResetFilters = () => {
    setSelectedState('All States');
    setSelectedCommodity('All Commodities');
    setSearchTerm('');
  };

  const hasActiveFilters =
    selectedState !== 'All States' ||
    selectedCommodity !== 'All Commodities' ||
    searchTerm.trim().length > 0;

  // Stats calculation
  const stats = useMemo(() => {
    const total = mandiData.length;
    if (total === 0) {
      return {
        total: summaryData?.total_tracked || 0,
        topGainer: summaryData?.top_gainers?.[0] || null,
        highestPrice: summaryData?.highest_price_crop || null,
        aboveMspRatio: '100%'
      };
    }

    const gainers = [...mandiData].filter((item) => String(item.change || '').startsWith('+'));
    gainers.sort((a, b) => {
      const pA = parseFloat(String(a.change || '0').replace('+', '').replace('%', '')) || 0;
      const pB = parseFloat(String(b.change || '0').replace('+', '').replace('%', '')) || 0;
      return pB - pA;
    });

    const highest = [...mandiData].reduce((prev, curr) =>
      (Number(curr.price) > Number(prev.price) ? curr : prev), mandiData[0]
    );

    const aboveMspCount = mandiData.filter((i) => (i.price || 0) >= (i.msp || 0)).length;
    const aboveMspRatio = `${Math.round((aboveMspCount / total) * 100)}%`;

    return {
      total,
      topGainer: gainers[0] || mandiData[0],
      highestPrice: highest,
      aboveMspRatio
    };
  }, [mandiData, summaryData]);

  return (
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Header & Source Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-8 h-8 text-green-600 shrink-0" />
              {t('mandi_title')}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${isLiveApi
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                }`}
            >
              <Radio className={`w-3 h-3 ${isLiveApi ? 'text-emerald-500 animate-pulse' : 'text-blue-500'}`} />
 
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            {t('mandi_desc')}
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchPrices(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-gray-700 text-sm font-medium rounded-xl transition-all shadow-xs disabled:opacity-50"
            title="Refresh rates from live server"
          >
            <RefreshCw className={`w-4 h-4 text-green-600 ${refreshing || loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Rates</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Tracked */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t('stat_total_commodities')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.total}
          </div>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            APMC Daily Arrivals
          </p>
        </div>

        {/* Metric 2: Top Gainer */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {t('stat_top_gainer')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 truncate">
            {stats.topGainer ? (
              <span title={stats.topGainer.crop}>{stats.topGainer.crop.split('(')[0]}</span>
            ) : (
              '--'
            )}
          </div>
          <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            {stats.topGainer?.change || '+0.0%'}
            <span className="font-normal text-gray-500">24h growth</span>
          </div>
        </div>

        {/* Metric 3: Highest Modal Rate */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              {t('stat_highest_rate')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            ₹{stats.highestPrice ? Number(stats.highestPrice.price).toLocaleString('en-IN') : '0'}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {stats.highestPrice ? stats.highestPrice.crop.split('(')[0] : 'Per Quintal'}
          </p>
        </div>

        {/* Metric 4: MSP Coverage */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              {t('stat_msp_coverage')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight">
            {stats.aboveMspRatio}
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
            Crops Above Support MSP
          </p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_mandi_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white placeholder-gray-400 shadow-xs"
            />
          </div>

          {/* State Filter Dropdown */}
          <div className="relative min-w-[180px] sm:min-w-[200px]">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium shadow-xs cursor-pointer"
            >
              <option value="All States">{t('filter_select_state')}</option>
              {(filterOptions.states.length > 0
                ? filterOptions.states.filter((s) => s !== 'All States')
                : ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Punjab', 'Tamil Nadu', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat']
              ).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Commodity Filter Dropdown */}
          <div className="relative min-w-[190px] sm:min-w-[220px]">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white font-medium shadow-xs cursor-pointer"
            >
              <option value="All Commodities">{t('filter_select_crop')}</option>
              {(filterOptions.commodities.length > 0
                ? filterOptions.commodities.filter((c) => c !== 'All Commodities')
                : ['Paddy(Dhan)(Common)', 'Wheat', 'Cotton', 'Chilli Red', 'Tomato', 'Onion', 'Potato', 'Maize', 'Soyabean', 'Groundnut', 'Turmeric', 'Mustard']
              ).map((cmd) => (
                <option key={cmd} value={cmd}>
                  {cmd}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
            >
              {t('btn_clear_filters')}
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-800 text-sm shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchPrices(true)}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Mandi Rates Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">{t('table_commodity')}</th>
                <th className="py-3.5 px-4">{t('table_mandi')}</th>
                <th className="py-3.5 px-4">{t('table_today_rate')}</th>
                <th className="py-3.5 px-4">{t('price_range_label')}</th>
                <th className="py-3.5 px-4">{t('table_msp')}</th>
                <th className="py-3.5 px-4">{t('table_trend')}</th>
                <th className="py-3.5 px-4 sm:pr-6">{t('table_arrival')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && mandiData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4">
                    <PageLoader variant="cards" label={t('mandi_loading')} count={3} />
                  </td>
                </tr>
              ) : mandiData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500 space-y-3">
                    <p className="font-semibold text-base text-gray-800">{t('mandi_empty')}</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Filter className="w-3.5 h-3.5" />
                        {t('btn_clear_filters')}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                mandiData.map((item) => {
                  const isPositive = String(item.change || '').startsWith('+');
                  const isAboveMsp = (item.price || 0) >= (item.msp || 0);

                  return (
                    <tr key={item.id} className="hover:bg-green-50/40 transition-colors group">

                      {/* Commodity & Variety */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <div className="font-black text-gray-900 text-base group-hover:text-green-800 transition-colors">
                            {item.crop}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {item.crop_name_native && (
                              <span className="font-semibold text-green-800 bg-green-100/70 px-2 py-0.5 rounded-md">
                                {item.crop_name_native}
                              </span>
                            )}
                            {item.variety && (
                              <span className="text-gray-500 font-medium">
                                {item.variety}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Mandi & District */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            {item.raw_mandi || item.mandi}
                          </div>
                          <div className="text-xs text-gray-500 pl-5">
                            {item.district && `${item.district}, `}{item.state}
                          </div>
                        </div>
                      </td>

                      {/* Modal Price */}
                      <td className="py-4 px-4">
                        <div className="font-black text-green-700 text-lg">
                          ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          Modal rate / Quintal
                        </div>
                      </td>

                      {/* Min - Max Range */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-gray-700">
                          ₹{Number(item.min_price || item.price || 0).toLocaleString('en-IN')} - ₹{Number(item.max_price || item.price || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Daily spread
                        </div>
                      </td>

                      {/* Govt MSP & Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-800 text-sm">
                            ₹{Number(item.msp || 0).toLocaleString('en-IN')}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isAboveMsp
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                          >
                            {isAboveMsp ? t('badge_above_msp') : t('badge_near_msp')}
                          </span>
                        </div>
                      </td>

                      {/* 24h Trend */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${isPositive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-700 shrink-0" />
                          )}
                          {item.change || '+0.0%'}
                        </span>
                      </td>

                      {/* Daily Arrival / Date */}
                      <td className="py-4 px-4 sm:pr-6">
                        <div className="text-xs font-semibold text-gray-700">
                          {item.arrival || 'Today'}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {item.updated_at || 'Live'}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
