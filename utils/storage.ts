import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

/**
 * PeriodStorage
 * A simple layer over AsyncStorage with in-memory caching to prevent
 * unnecessary disk reads and bridge crossing on frequent tab switches.
 */

let cachedEntries: string | null = null;

export const PeriodStorage = {
  /**
   * Retrieves period entries from cache or AsyncStorage.
   * If available in cache, returns immediately without async bridge call.
   */
  async getEntries(): Promise<string | null> {
    if (cachedEntries !== null) {
      return cachedEntries;
    }
    const entries = await AsyncStorage.getItem('periodEntries');
    cachedEntries = entries;
    return entries;
  },

  /**
   * Saves period entries to AsyncStorage and updates the cache.
   * Ensures subsequent reads are consistent.
   */
  async saveEntries(entriesString: string): Promise<void> {
    cachedEntries = entriesString;
    await AsyncStorage.setItem('periodEntries', entriesString);
  },

  /**
   * Clears the cache. Useful for testing or full reset.
   */
  clearCache() {
    cachedEntries = null;
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
