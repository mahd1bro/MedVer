export interface ProductLookup {
  id: string;
  inputType: 'barcode' | 'ocr' | 'manual';
  inputValue: string;
  normalizedQuery: string;
  greenbook: {
    status: 'registered' | 'not_found' | 'error';
    title?: string;
    regNo?: string;
    link?: string;
    lastChecked: string;
  };
  alerts?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  regNo?: string;
  manufacturer?: string;
  category?: string;
}

export interface VerifyRequest {
  barcode?: string;
  regNo?: string;
  name?: string;
}

export interface VerifyResponse {
  product: ProductLookup;
}

export interface AppConfig {
  API_BASE_URL: string;
  DEFAULT_LANGUAGE: string;
  CACHE_TTL_HOURS: number;
  GREENBOOK_BASE_URL: string;
  MAS_SHORTCODE: string;
}

export interface NetworkStatus {
  isConnected: boolean;
  type: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}