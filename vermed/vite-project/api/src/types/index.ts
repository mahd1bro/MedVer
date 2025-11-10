import { z } from 'zod';

// Shared types with mobile app
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

// API Request/Response schemas
export const SearchRequestSchema = z.object({
  q: z.string().min(1).max(100),
});

export const VerifyRequestSchema = z.object({
  barcode: z.string().optional(),
  regNo: z.string().optional(),
  name: z.string().optional(),
}).refine(
  (data) => data.barcode || data.regNo || data.name,
  {
    message: "At least one of barcode, regNo, or name must be provided",
  }
);

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface GreenbookProduct {
  title: string;
  regNo?: string;
  manufacturer?: string;
  category?: string;
  status: 'registered' | 'not_found';
  link?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}