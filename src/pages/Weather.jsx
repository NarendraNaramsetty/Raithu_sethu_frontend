import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertCircle,
  RefreshCw,
  MapPin,
  Compass,
  Calendar
} from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ICON_MAP = {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
};

export default function Weather() {
  const { t } = useLanguage();
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Detecting location...');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const fetchWeatherForLocation = async (lat, lon, customName) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
        params.location = customName || 'Your Current Location';
      }

      const [currentData, forecastData] = await Promise.all([
        api.weather.getCurrent(params),
        api.weather.getForecast(params),
      ]);
      
      setCurrentWeather(currentData);
      setForecast(forecastData);
      if (currentData?.location_name) {
        setLocationLabel(currentData.location_name);
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Could not retrieve live weather advisory. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect browser geolocation on component mount
  const detectLocationAndFetch = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Local Farm Region');
      fetchWeatherForLocation();
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        // Optional: Get city/district name via free reverse geocoding API
        let detectedCity = 'Your Current Location';
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          if (data.locality || data.city || data.principalSubdivision) {
            detectedCity = `${data.locality || data.city || ''}, ${data.principalSubdivision || ''}`.replace(/^, /, '');
          }
        } catch {
          detectedCity = 'Your GPS Location';
        }

        setLocationLabel(detectedCity);
        setIsDetectingLocation(false);
        fetchWeatherForLocation(latitude, longitude, detectedCity);
      },
      (err) => {
        // Silently fallback to default region if user denied geolocation or unavailable
        setIsDetectingLocation(false);
        setLocationLabel('Local Farm Region (Guntur)');
        fetchWeatherForLocation();
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    detectLocationAndFetch();
  }, []);

  const handleRefresh = () => {
    if (coords) {
      fetchWeatherForLocation(coords.lat, coords.lon, locationLabel);
    } else {
      detectLocationAndFetch();
    }
  };

  return (
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header & Auto Location Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <CloudSun className="w-8 h-8 text-green-600" />
            {t('weather_title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('weather_desc')}
          </p>
        </div>

        {/* Live Location & Refresh Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs font-semibold shadow-xs">
            <MapPin className="w-4 h-4 text-green-600 shrink-0" />
            <span>{isDetectingLocation ? 'Detecting GPS...' : locationLabel}</span>
          </div>

          <button
            type="button"
            onClick={detectLocationAndFetch}
            disabled={isDetectingLocation || loading}
            className="p-2.5 bg-white border border-gray-200 hover:bg-green-50 hover:text-green-700 text-gray-600 rounded-xl transition-colors shrink-0 shadow-xs"
            title="Redetect GPS & Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || isDetectingLocation) ? 'animate-spin text-green-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !currentWeather ? (
        <PageLoader variant="weather" label={t('weather_loading')} />
      ) : currentWeather ? (
        <>
          {/* Current Live Weather Card */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                  {t('live_village_forecast')} • {currentWeather.location_name || locationLabel}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-5xl sm:text-6xl font-extrabold">{currentWeather.temperature}</span>
                  <div>
                    <p className="text-lg font-semibold">{currentWeather.condition}</p>
                    <p className="text-xs text-emerald-200">
                      {t('feels_like')} {currentWeather.feels_like} • {currentWeather.uv_index} {t('uv_index')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center">
                  <Droplets className="w-5 h-5 mx-auto text-emerald-200 mb-1" />
                  <p className="text-xs text-emerald-200">{t('humidity')}</p>
                  <p className="text-base font-bold">{currentWeather.humidity}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center">
                  <Wind className="w-5 h-5 mx-auto text-emerald-200 mb-1" />
                  <p className="text-xs text-emerald-200">{t('wind')}</p>
                  <p className="text-base font-bold">{currentWeather.wind_speed}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-center">
                  <CloudRain className="w-5 h-5 mx-auto text-emerald-200 mb-1" />
                  <p className="text-xs text-emerald-200">{t('rain_chance')}</p>
                  <p className="text-base font-bold">{currentWeather.rain_probability}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Farmer Agro-Spray Advisory Alert */}
          {currentWeather.advisory_headline && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-amber-900">
                  {currentWeather.advisory_headline}
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {currentWeather.advisory_detail}
                </p>
              </div>
            </div>
          )}

          {/* 7-Day Accurate Forecast Grid */}
          {forecast.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  {t('forecast_6day')}
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  Live meteorological data via Open-Meteo
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {forecast.map((item) => {
                  const Icon = ICON_MAP[item.icon] || CloudSun;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-100 p-4 text-center space-y-2 shadow-xs hover:border-green-200 transition-colors"
                    >
                      <p className="text-xs font-bold text-gray-700">{item.day}</p>
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900">{item.temp}</p>
                      <p className="text-[11px] text-gray-500 truncate">{item.condition}</p>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600">
                        <Droplets className="w-3 h-3" />
                        {item.rain}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}

    </div>
  );
}
