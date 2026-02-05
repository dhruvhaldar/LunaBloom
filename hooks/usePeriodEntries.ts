import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { PeriodStorage } from '@/utils/storage';
import { parseSafePeriodEntries } from '@/utils/validation';
import { useFocusEffect } from 'expo-router';
import { HistoryEntry } from '@/components/HistoryItem';

export function usePeriodEntries() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Ref to store the raw string of the last fetched entries to avoid unnecessary re-parsing and re-renders
  const lastFetchedEntriesRef = useRef<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      // Bolt Optimization: Use cached PeriodStorage to avoid disk reads on tab switch
      const storedEntries = await PeriodStorage.getEntries();

      // Optimization: Only parse and update state if the data has actually changed
      if (storedEntries === lastFetchedEntriesRef.current) {
        setIsLoading(false);
        return;
      }
      lastFetchedEntriesRef.current = storedEntries;

      // Security: Safely parse entries to prevent DoS/Crashes if storage is corrupted
      const parsedEntries = parseSafePeriodEntries(storedEntries);
      setEntries(parsedEntries);
    } catch (error: any) {
      console.error('Error fetching period entries:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on navigation focus
  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  // Security: Clear sensitive data on background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Clear sensitive PHI from memory when app is backgrounded
        setEntries([]);
        lastFetchedEntriesRef.current = null; // Reset cache ref to ensure re-fetch on return
      } else if (nextAppState === 'active') {
        // Re-fetch data when app comes to foreground
        fetchEntries();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchEntries]);

  return {
    entries,
    isLoading,
    refresh: fetchEntries,
    setEntries
  };
}
