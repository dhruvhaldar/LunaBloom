import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useChatbot } from '../useChatbot.native';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { initLlama } from 'llama.rn';
import RNFS from 'react-native-fs';

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

jest.mock('react-native-fs', () => ({
  hash: jest.fn(),
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
  const MODEL_SHA256 = '1d0e9419ec4e12aef73ccf4ffd122703e94c48344a96bc7c5f0f2772c2152ce3';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Model does not exist initially
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
  });

  it('verifies integrity (checksum) after download and deletes corrupted file', async () => {
    // Mock download success
    const mockDownloadAsync = jest.fn().mockResolvedValue({ uri: 'file:///path/to/model.gguf' });
    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue({
      downloadAsync: mockDownloadAsync,
    });

    // Mock getInfoAsync:
    // 1. Initial check (does not exist)
    // 2. Check after download (exists and CORRECT size, but we'll fail hash)
    (FileSystem.getInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ exists: false })
      .mockResolvedValueOnce({ exists: true, size: MODEL_SIZE_BYTES });

    // Mock RNFS.hash to return WRONG hash
    (RNFS.hash as jest.Mock).mockResolvedValue('wrong_hash');

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

  it('uses secure Llama 3 prompt format', async () => {
    const mockCompletion = jest.fn().mockResolvedValue({ text: 'Response' });
    (initLlama as jest.Mock).mockResolvedValue({
      completion: mockCompletion,
    });

    // Mock model exists
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: MODEL_SIZE_BYTES
    });

    // Mock Correct Hash
    (RNFS.hash as jest.Mock).mockResolvedValue(MODEL_SHA256);

    const { result } = renderHook(() => useChatbot());

    // Wait for initial checkModelExists to complete and update state
    await waitFor(() => expect(result.current.isModelDownloaded).toBe(true));

    // Initialize
    await act(async () => {
      await result.current.initializeLlama();
    });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    // Send chat
    await act(async () => {
      await result.current.handleChat('Hello');
    });

    expect(mockCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringMatching(
            /<\|begin_of_text\|><\|start_header_id\|>system<\|end_header_id\|>.*<\|start_header_id\|>user<\|end_header_id\|>\n\nHello<\|eot_id\|>/s
        ),
        stop: expect.arrayContaining(['<|eot_id|>', '<|end_of_text|>']),
      }),
      expect.any(Function)
    );
  });

  it('fails initialization if integrity check fails', async () => {
    // Mock model exists
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: MODEL_SIZE_BYTES
    });

    // Mock Wrong Hash
    (RNFS.hash as jest.Mock).mockResolvedValue('corrupted_hash');

    const { result } = renderHook(() => useChatbot());

    // Wait for initial checkModelExists to complete and update state
    await waitFor(() => expect(result.current.isModelDownloaded).toBe(true));

    // Initialize
    await act(async () => {
      await result.current.initializeLlama();
    });

    // Expect initialization to fail
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Integrity Error',
        expect.stringContaining('corrupted')
      );
      expect(result.current.isReady).toBe(false);
    });
  });
});
