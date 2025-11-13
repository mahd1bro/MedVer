import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { translations } from './translations';


// Create i18n instance
const i18n = new I18n(translations);

// Set initial locale
i18n.locale = Localization.getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Create context
interface TranslationContextType {
  t: (key: string) => string;
  locale: string;
  setLocale: (locale: string) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  t: (key: string) => key,
  locale: 'en',
  setLocale: () => {},
});

// Provider component
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(i18n.locale);

  const setLocale = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
  };

  const t = (key: string) => {
    return i18n.t(key);
  };

  return (
    <TranslationContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Hook to use translations
export function useTranslation() {
  return useContext(TranslationContext);
}