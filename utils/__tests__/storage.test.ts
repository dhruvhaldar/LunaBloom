import { PeriodStorage, initializeStorageProtection } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
// Mock validation to avoid strict schema checks in storage tests
import { parseSafePeriodEntries } from '../validation';

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

// Mock validation
jest.mock('../validation', () => ({
  parseSafePeriodEntries: jest.fn(),
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

  it('deduplicates concurrent getEntries calls', async () => {
    // Bolt Optimization Test: Verify deduplication
    // Simulate a slow async operation
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve('concurrent-data'), 10))
    );

    // Call getEntries twice concurrently
    const promise1 = PeriodStorage.getEntries();
    const promise2 = PeriodStorage.getEntries();

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(result1).toBe('concurrent-data');
    expect(result2).toBe('concurrent-data');

    // Should only hit AsyncStorage once
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
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

  it('getParsedEntries caches parsed result and returns reference', async () => {
    const rawData = '["test"]';
    const parsedData = ['test'];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(rawData);
    (parseSafePeriodEntries as jest.Mock).mockReturnValue(parsedData);

    // First call: gets string, parses it
    const result1 = await PeriodStorage.getParsedEntries();
    expect(result1).toBe(parsedData);
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(parseSafePeriodEntries).toHaveBeenCalledWith(rawData);

    // Second call: should return cached array reference without re-parsing
    const result2 = await PeriodStorage.getParsedEntries();
    expect(result2).toBe(result1); // Reference equality!
    expect(parseSafePeriodEntries).toHaveBeenCalledTimes(1);
  });

  it('saveEntries invalidates parsed cache', async () => {
    const rawData = '["old"]';
    const parsedDataOld = ['old'];
    const parsedDataNew = ['new'];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(rawData);
    (parseSafePeriodEntries as jest.Mock).mockReturnValueOnce(parsedDataOld).mockReturnValueOnce(parsedDataNew);

    // Populate cache
    await PeriodStorage.getParsedEntries();
    expect(parseSafePeriodEntries).toHaveBeenCalledTimes(1);

    // Save new data
    const newData = '["new"]';
    await PeriodStorage.saveEntries(newData);

    // getParsedEntries should re-parse
    const result = await PeriodStorage.getParsedEntries();
    expect(result).toBe(parsedDataNew);
    expect(parseSafePeriodEntries).toHaveBeenCalledTimes(2);
    expect(parseSafePeriodEntries).toHaveBeenCalledWith(newData);
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
