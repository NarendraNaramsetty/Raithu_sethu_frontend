import {
  Home,
  ScanLine,
  TrendingUp,
  Landmark,
  CloudSun,
  Users,
} from 'lucide-react';

/**
 * Main navigation links for RaithuSetu
 */
export const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Disease Detection', path: '/disease-detection', icon: ScanLine, badge: 'AI' },
  { name: 'Market Prices', path: '/market-prices', icon: TrendingUp },
  { name: 'Govt Schemes', path: '/govt-schemes', icon: Landmark },
  { name: 'Weather', path: '/weather', icon: CloudSun },
  { name: 'Community', path: '/community', icon: Users },
];
