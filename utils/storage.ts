import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { parseSafePeriodEntries } from './validation';

/**
 * PeriodStorage
 * A simple layer over AsyncStorage with in-memory caching to prevent
 * unnecessary disk reads and bridge crossing on frequent tab switches.
 */

let cachedEntries: string | null = null;
// Bolt Optimization: Cache parsed entries to avoid repeated JSON parsing and validation loops
let cachedParsedEntries: any[] | null = null;
// Bolt Optimization: Track pending promise to deduplicate concurrent requests
let pendingGetEntriesPromise: Promise<string | null> | null = null;

export const PeriodStorage = {
  /**
   * Retrieves period entries from cache or AsyncStorage.
   * If available in cache, returns immediately without async bridge call.
   * If a fetch is already in progress, returns the existing promise (deduplication).
   */
  async getEntries(): Promise<string | null> {
    if (cachedEntries !== null) {
      return cachedEntries;
    }

    // Bolt Optimization: If a request is already in flight, reuse it.
    // This prevents multiple AsyncStorage calls when multiple components load simultaneously.
    if (pendingGetEntriesPromise) {
      return pendingGetEntriesPromise;
    }

    pendingGetEntriesPromise = (async () => {
      try {
        const entries = await AsyncStorage.getItem('periodEntries');
        cachedEntries = entries;
        return entries;
      } finally {
        // Clear the pending promise so future calls can retry if needed (though cache should handle it)
        pendingGetEntriesPromise = null;
      }
    })();

    return pendingGetEntriesPromise;
  },

  /**
   * Retrieves parsed period entries from cache, or parses them if needed.
   * This avoids the O(N) cost of validation and JSON parsing on repeated access.
   */
  async getParsedEntries(): Promise<any[]> {
    // Ensure the raw string cache is populated
    await this.getEntries();

    if (cachedParsedEntries !== null) {
      return cachedParsedEntries;
    }

    // Parse and cache the result
    // parseSafePeriodEntries handles null/empty strings gracefully returning []
    cachedParsedEntries = parseSafePeriodEntries(cachedEntries);
    return cachedParsedEntries;
  },

  /**
   * Saves period entries to AsyncStorage and updates the cache.
   * Ensures subsequent reads are consistent.
   */
  async saveEntries(entriesString: string): Promise<void> {
    cachedEntries = entriesString;
    // Invalidate parsed cache as data has changed
    cachedParsedEntries = null;
    await AsyncStorage.setItem('periodEntries', entriesString);
  },

  /**
   * Clears the cache. Useful for testing or full reset.
   */
  clearCache() {
    cachedEntries = null;
    cachedParsedEntries = null;
    pendingGetEntriesPromise = null;
  }
};

/**
 * Initializes security protection for storage.
 * Listens to AppState changes and clears sensitive in-memory cache
 * when the app goes to the background to prevent memory scraping/dumps.
 */
export const initializeStorageProtection = () => {
  const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      PeriodStorage.clearCache();
    }
  });

  return () => {
    subscription.remove();
  };
};
