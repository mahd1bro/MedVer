import { AppConfig } from '@/types';

export const config: AppConfig = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  DEFAULT_LANGUAGE: process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE || 'en',
  CACHE_TTL_HOURS: parseInt(process.env.EXPO_PUBLIC_CACHE_TTL_HOURS || '24', 10),
  GREENBOOK_BASE_URL: 'https://www.nafdac.gov.ng',
  MAS_SHORTCODE: '38353' // Placeholder - actual shortcode should be verified
};