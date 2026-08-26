/**
 * PageLoader — Professional animated loading states for RaithuSetu
 *
 * Variants:
 *  <PageLoader />                  — default full-panel pulse ring + dots
 *  <PageLoader variant="scan" />   — AI scan animation (Disease Detection)
 *  <PageLoader variant="cards" />  — shimmer skeleton cards (Schemes / Market)
 *  <PageLoader variant="weather"/> — shimmer weather skeleton
 *  <PageLoader variant="posts" />  — shimmer post skeletons (Community)
 *  <PageLoader variant="inline" /> — small inline spinner for buttons/rows
 */

import React, { useEffect, useState } from 'react';
import { Leaf, Wifi, CloudSun, BarChart3, Users } from 'lucide-react';

// ─── Shimmer base ────────────────────────────────────────────────────────────
function Shimmer({ className = '' }) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.4s_ease-in-out_infinite] rounded-xl ${className}`}
    />
  );
}

// ─── Animated dots ────────────────────────────────────────────────────────────
function Dots({ color = 'bg-green-500' }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${color} animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

// ─── Pulse ring ───────────────────────────────────────────────────────────────
function PulseRing({ icon: Icon, color = 'green' }) {
  const ringColor = {
    green: 'border-green-500/30',
    blue:  'border-blue-500/30',
    amber: 'border-amber-500/30',
  }[color] || 'border-green-500/30';

  const iconBg = {
    green: 'bg-green-600',
    blue:  'bg-blue-600',
    amber: 'bg-amber-500',
  }[color] || 'bg-green-600';

  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
      {/* Outer pulse ring */}
      <span className={`absolute inset-0 rounded-full border-4 ${ringColor} animate-ping opacity-60`} />
      {/* Middle ring */}
      <span className={`absolute inset-2 rounded-full border-2 ${ringColor} animate-pulse`} />
      {/* Icon center */}
      <div className={`relative w-11 h-11 rounded-full ${iconBg} text-white flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ steps, currentStep }) {
  return (
    <div className="w-full max-w-xs mx-auto space-y-2">
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-green-700 font-semibold text-center animate-pulse">
        {steps[currentStep]}
      </p>
    </div>
  );
}

// ─── VARIANT: scan (Disease Detection AI) ────────────────────────────────────
function ScanLoader({ label, sublabel, progress = 0 }) {
  const steps = [
    'Reading image pixels...',
    'Detecting crop type...',
    'Matching disease patterns...',
    'Preparing treatment plan...',
    'Almost done...',
  ];

  // Pick the step label based on progress bracket
  const stepIndex = Math.min(
    Math.floor((progress / 100) * steps.length),
    steps.length - 1
  );

  return (
    <div className="py-16 flex flex-col items-center gap-6">
      {/* Scan ring animation */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-green-600 border-r-green-400 border-b-transparent border-l-transparent animate-spin" />
        <div
          className="absolute inset-3 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-emerald-300"
          style={{ animation: 'spin 1.8s linear infinite reverse' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-600 animate-pulse" />
          </div>
        </div>
        <div
          className="absolute left-1/2 top-1/2 w-10 h-0.5 bg-gradient-to-r from-green-500 to-transparent"
          style={{ animation: 'spin 1.2s linear infinite', transformOrigin: 'left center', marginTop: '-1px' }}
        />
      </div>

      <div className="text-center space-y-1">
        <p className="text-base font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>

      {/* Progress bar — real fill based on progress prop */}
      <div className="w-full max-w-xs mx-auto space-y-2">
        {/* Percentage label */}
        <div className="flex items-center justify-between text-xs font-semibold px-0.5">
          <span className="text-green-700 animate-pulse">{steps[stepIndex]}</span>
          <span className="text-gray-500 font-mono">{Math.round(progress)}%</span>
        </div>

        {/* Track */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          {/* Fill */}
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: progress >= 100
                ? 'linear-gradient(90deg, #16a34a, #10b981)'
                : 'linear-gradient(90deg, #16a34a, #34d399, #16a34a)',
              backgroundSize: progress >= 100 ? 'auto' : '200% 100%',
              animation: progress >= 100 ? 'none' : 'shimmer 1.2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Completion flash */}
        {progress >= 100 && (
          <p className="text-center text-xs font-bold text-green-600 animate-pulse">
            ✓ Analysis complete — loading results...
          </p>
        )}
      </div>
    </div>
  );
}

// ─── VARIANT: cards (Schemes / Market) ───────────────────────────────────────
function CardsLoader({ count = 3, label, icon: Icon, iconColor = 'text-green-600' }) {
  return (
    <div className="py-6 space-y-5">
      {/* Header shimmer */}
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className={`w-5 h-5 ${iconColor} animate-pulse shrink-0`} />}
        <div className="space-y-1.5 flex-1">
          <Shimmer className="h-4 w-48" />
          <Shimmer className="h-3 w-32" />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-500 animate-pulse text-center">{label}</p>
      {/* Card skeletons */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-sm"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-start gap-3">
            <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
            <Shimmer className="h-6 w-20 rounded-full shrink-0" />
          </div>
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-5/6" />
          <div className="flex gap-2 pt-1">
            <Shimmer className="h-8 w-24 rounded-xl" />
            <Shimmer className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VARIANT: weather ─────────────────────────────────────────────────────────
function WeatherLoader({ label }) {
  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <CloudSun className="w-5 h-5 text-sky-500 animate-pulse" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">{label}</p>
      </div>
      {/* Current weather hero skeleton */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl border border-sky-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Shimmer className="h-5 w-36" />
            <Shimmer className="h-12 w-24" />
            <Shimmer className="h-3 w-28" />
          </div>
          <Shimmer className="w-20 h-20 rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 text-center">
              <Shimmer className="h-5 w-5 rounded-full mx-auto" />
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-4 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Forecast row skeletons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 space-y-2 text-center">
            <Shimmer className="h-3 w-10 mx-auto" />
            <Shimmer className="h-8 w-8 rounded-full mx-auto" />
            <Shimmer className="h-4 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VARIANT: posts (Community) ───────────────────────────────────────────────
function PostsLoader({ label }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 py-2">
        <Users className="w-4 h-4 text-green-600 animate-pulse" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">{label}</p>
        <Dots />
      </div>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
          style={{ opacity: 1 - i * 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <Shimmer className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-3.5 w-32" />
              <Shimmer className="h-3 w-48" />
            </div>
            <Shimmer className="h-5 w-16 rounded-lg" />
          </div>
          {/* Content lines */}
          <div className="space-y-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-11/12" />
            <Shimmer className="h-3 w-4/5" />
          </div>
          {/* Action bar */}
          <div className="flex gap-4 pt-1 border-t border-gray-50">
            <Shimmer className="h-4 w-20 rounded" />
            <Shimmer className="h-4 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VARIANT: inline (small spinner for buttons / table rows) ─────────────────
function InlineLoader({ color = 'green', size = 'md' }) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }[size] || 'w-5 h-5';
  const colorClass = {
    green: 'border-green-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray:  'border-gray-400 border-t-transparent',
  }[color] || 'border-green-600 border-t-transparent';

  return (
    <span
      className={`inline-block rounded-full border-2 ${colorClass} ${sizeClass} animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}

// ─── Default loader (full panel) ─────────────────────────────────────────────
function DefaultLoader({ label, sublabel, icon: Icon = Wifi }) {
  return (
    <div className="py-20 flex flex-col items-center gap-6">
      <PulseRing icon={Icon} color="green" />
      <div className="text-center space-y-1.5">
        <p className="text-base font-bold text-gray-800">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 max-w-xs">{sublabel}</p>}
      </div>
      <Dots />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PageLoader({
  variant  = 'default',
  label    = 'Loading...',
  sublabel = '',
  count    = 3,
  icon,
  color    = 'green',
  size     = 'md',
  progress = 0,
}) {
  switch (variant) {
    case 'scan':    return <ScanLoader    label={label} sublabel={sublabel} progress={progress} />;
    case 'cards':   return <CardsLoader   label={label} count={count} icon={icon} />;
    case 'weather': return <WeatherLoader label={label} />;
    case 'posts':   return <PostsLoader   label={label} />;
    case 'inline':  return <InlineLoader  color={color} size={size} />;
    default:        return <DefaultLoader label={label} sublabel={sublabel} icon={icon || Wifi} />;
  }
}

// Named sub-exports for direct use
export { Dots, InlineLoader, PulseRing, Shimmer };
