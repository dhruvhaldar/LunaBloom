import { PeriodStorage } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('PeriodStorage', () => {
  beforeEach(() => {
    PeriodStorage.clearCache();
    jest.clearAllMocks();
  });

  it('getEntries calls AsyncStorage on first call', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-data');

    const result = await PeriodStorage.getEntries();

    expect(result).toBe('test-data');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('periodEntries');
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it('getEntries returns cached value on second call without hitting AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-data');

    // First call populates cache
    await PeriodStorage.getEntries();
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const result = await PeriodStorage.getEntries();
    expect(result).toBe('test-data');
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1); // Call count remains 1
  });

  it('saveEntries updates cache and calls AsyncStorage', async () => {
    const newData = 'new-data';
    await PeriodStorage.saveEntries(newData);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('periodEntries', newData);

    // Verify cache is updated by calling getEntries
    const result = await PeriodStorage.getEntries();
    expect(result).toBe(newData);
    expect(AsyncStorage.getItem).not.toHaveBeenCalled(); // Should not call getItem if cache is hit
  });
});
