import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useChatbot } from '../useChatbot.native';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///data/user/0/com.lunabloom/files/',
  getInfoAsync: jest.fn(),
  deleteAsync: jest.fn(),
  createDownloadResumable: jest.fn(),
}));

jest.mock('llama.rn', () => ({
  initLlama: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

// Mock validation utils
jest.mock('@/utils/validation', () => ({
  validateInputLength: jest.fn(() => true),
  sanitizeInput: jest.fn(text => text),
  sanitizePromptInput: jest.fn(text => text),
  containsSuspiciousPatterns: jest.fn(() => false),
  MAX_INPUT_LENGTH: 500,
}));

describe('useChatbot Native Hook', () => {
  const MODEL_SIZE_BYTES = 807690656;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Model does not exist initially
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
  });

  it('verifies integrity after download and deletes corrupted file', async () => {
    // Mock download success but file size mismatch (corruption)
    const mockDownloadAsync = jest.fn().mockResolvedValue({ uri: 'file:///path/to/model.gguf' });
    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue({
      downloadAsync: mockDownloadAsync,
    });

    // Mock getInfoAsync:
    // 1. Initial check (does not exist)
    // 2. Check after download (exists but wrong size)
    (FileSystem.getInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true, size: 12345 });

    const { result } = renderHook(() => useChatbot());

    // Trigger download
    await act(async () => {
      await result.current.downloadModel();
    });

    // Wait for async operations
    await waitFor(() => {
       // With the fix, we expect deleteAsync to be called
       expect(FileSystem.deleteAsync).toHaveBeenCalled();

       // And Alert to report corruption
       expect(Alert.alert).toHaveBeenCalledWith(
         'Error',
         expect.stringContaining('corrupted')
       );

       // And model should NOT be marked as downloaded
       expect(result.current.isModelDownloaded).toBe(false);
    });
  });
});
