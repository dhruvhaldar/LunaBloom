import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { PeriodStorage } from '@/utils/storage';
import { useFocusEffect } from 'expo-router';
import { HistoryEntry } from '@/components/HistoryItem';

export function usePeriodEntries() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Ref to store the reference of the last fetched entries array to avoid unnecessary re-renders
  const lastFetchedEntriesRef = useRef<any[] | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      // Bolt Optimization: Use cached parsed entries from storage directly
      // This skips JSON parsing and validation if the data hasn't changed
      const parsedEntries = await PeriodStorage.getParsedEntries();

      // Optimization: Only update state if the array reference has changed
      if (parsedEntries === lastFetchedEntriesRef.current) {
        setIsLoading(false);
        return;
      }
      lastFetchedEntriesRef.current = parsedEntries;

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
