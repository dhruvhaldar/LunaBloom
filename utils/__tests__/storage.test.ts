import { PeriodStorage, initializeStorageProtection } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
  },
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

describe('initializeStorageProtection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PeriodStorage.clearCache();
  });

  it('clears cache when AppState changes to background', () => {
    const mockRemove = jest.fn();
    // Use type assertion for the mock
    (AppState.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });

    const spyClearCache = jest.spyOn(PeriodStorage, 'clearCache');

    const cleanup = initializeStorageProtection();

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    // Simulate background state
    // Get the handler that was passed to addEventListener
    const handler = (AppState.addEventListener as jest.Mock).mock.calls[0][1];

    // Call it with 'active' -> should NOT clear
    handler('active');
    expect(spyClearCache).not.toHaveBeenCalled();

    // Call it with 'background' -> should clear
    handler('background');
    expect(spyClearCache).toHaveBeenCalled();

    // Verify cleanup
    cleanup();
    expect(mockRemove).toHaveBeenCalled();
  });
});
