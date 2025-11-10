import { create } from 'zustand';
import { ProductLookup } from '@/types';

interface AppState {
  // Current verification state
  isVerifying: boolean;
  currentLookup: ProductLookup | null;
  
  // Recent lookups
  recentLookups: ProductLookup[];
  
  // UI state
  showCamera: boolean;
  networkError: string | null;
  
  // Settings
  analyticsEnabled: boolean;
  language: string;
  
  // Actions
  setVerifying: (verifying: boolean) => void;
  setCurrentLookup: (lookup: ProductLookup | null) => void;
  setRecentLookups: (lookups: ProductLookup[]) => void;
  addRecentLookup: (lookup: ProductLookup) => void;
  setShowCamera: (show: boolean) => void;
  setNetworkError: (error: string | null) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
  
  // Clear actions
  clearCurrentLookup: () => void;
  clearNetworkError: () => void;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isVerifying: false,
  currentLookup: null,
  recentLookups: [],
  showCamera: false,
  networkError: null,
  analyticsEnabled: true,
  language: 'en',

  // Basic setters
  setVerifying: (verifying) => set({ isVerifying: verifying }),
  setCurrentLookup: (lookup) => set({ currentLookup: lookup }),
  setRecentLookups: (lookups) => set({ recentLookups: lookups }),
  setShowCamera: (show) => set({ showCamera: show }),
  setNetworkError: (error) => set({ networkError: error }),
  setAnalyticsEnabled: (enabled) => set({ analyticsEnabled: enabled }),
  setLanguage: (language) => set({ language }),

  // Complex actions
  addRecentLookup: (lookup) => {
    const { recentLookups } = get();
    const filtered = recentLookups.filter(item => item.id !== lookup.id);
    const updated = [lookup, ...filtered].slice(0, 20); // Keep last 20
    set({ recentLookups: updated });
  },

  // Clear actions
  clearCurrentLookup: () => set({ currentLookup: null }),
  clearNetworkError: () => set({ networkError: null }),
  clearAllData: () => set({
    currentLookup: null,
    recentLookups: [],
    networkError: null
  })
}));