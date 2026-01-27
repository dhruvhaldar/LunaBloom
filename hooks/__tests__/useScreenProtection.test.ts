import { renderHook, waitFor } from '@testing-library/react-native';
import { useScreenProtection } from '../useScreenProtection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenCapture from 'expo-screen-capture';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(),
}));

describe('useScreenProtection Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enables screen protection when setting is true', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

    renderHook(() => useScreenProtection());

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('preventScreenshots');
      expect(ScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
    });
  });

  it('does NOT enable screen protection when setting is false', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');

    renderHook(() => useScreenProtection());

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('preventScreenshots');
      expect(ScreenCapture.preventScreenCaptureAsync).not.toHaveBeenCalled();
    });
  });

  it('does NOT enable screen protection when setting is null', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    renderHook(() => useScreenProtection());

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('preventScreenshots');
      expect(ScreenCapture.preventScreenCaptureAsync).not.toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage Error'));

      renderHook(() => useScreenProtection());

      await waitFor(() => {
          expect(AsyncStorage.getItem).toHaveBeenCalled();
          expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize screen protection', expect.any(Error));
      });

      consoleSpy.mockRestore();
  });
});
