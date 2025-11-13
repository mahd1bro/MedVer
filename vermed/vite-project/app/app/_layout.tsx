import { Stack } from 'expo-router';
import { TranslationProvider } from './contexts/TranslationContext';

export default function Layout() {
  return (
    <TranslationProvider>
      <Stack
        screenOptions={{
        headerShown: false,
        }}
      />
    </TranslationProvider>
  );
}