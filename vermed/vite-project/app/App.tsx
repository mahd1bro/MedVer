import React from 'react';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useAppStore } from '@/state/store';
import { RecentsService } from '@/services/cache';
import { useEffect } from 'react';

export default function App(): React.JSX.Element {
  const { setRecentLookups } = useAppStore();

  // Load recent lookups on app start
  useEffect(() => {
    const loadRecents = async () => {
      try {
        const recents = await RecentsService.getAll();
        setRecentLookups(recents);
      } catch (error) {
        console.error('Failed to load recent lookups:', error);
      }
    };

    loadRecents();
  }, [setRecentLookups]);

  return <AppNavigator />;
}