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
  const CORRECT_HASH = '1d0e9419ec4e12aef73ccf4ffd122703e94c48344a96bc7c5f0f2772c2152ce3';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Model does not exist initially
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
  });

  it('downloads model from pinned URL', async () => {
    const PINNED_URL = 'https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/39ba0224812e8139187a155573a27d1004ef716f/llama-3.2-1b-instruct-q4_k_m.gguf';

    const mockDownloadAsync = jest.fn().mockResolvedValue({ uri: 'file:///path/to/model.gguf' });
    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue({
      downloadAsync: mockDownloadAsync,
    });

    // Mock getInfoAsync: Does not exist
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

    const { result } = renderHook(() => useChatbot());

    await act(async () => {
      await result.current.downloadModel();
    });

    expect(FileSystem.createDownloadResumable).toHaveBeenCalledWith(
      PINNED_URL,
      expect.any(String),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('verifies size integrity after download and deletes corrupted file (wrong size)', async () => {
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
       expect(FileSystem.deleteAsync).toHaveBeenCalled();
       expect(Alert.alert).toHaveBeenCalledWith(
         'Error',
         expect.stringContaining('corrupted')
       );
       expect(result.current.isModelDownloaded).toBe(false);
    });
  });

  it('verifies hash integrity after download and deletes corrupted file (wrong hash)', async () => {
      // Mock download success
      const mockDownloadAsync = jest.fn().mockResolvedValue({ uri: 'file:///path/to/model.gguf' });
      (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue({
        downloadAsync: mockDownloadAsync,
      });

      // Mock getInfoAsync: Correct size
      (FileSystem.getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: false })
        .mockResolvedValueOnce({ exists: true, size: MODEL_SIZE_BYTES });

      // Mock RNFS.hash: Wrong hash
      (RNFS.hash as jest.Mock).mockResolvedValue('wronghash123');

      const { result } = renderHook(() => useChatbot());

      // Trigger download
      await act(async () => {
        await result.current.downloadModel();
      });

      await waitFor(() => {
         expect(RNFS.hash).toHaveBeenCalledWith(expect.stringContaining('llama'), 'sha256');
         expect(FileSystem.deleteAsync).toHaveBeenCalled();
         expect(Alert.alert).toHaveBeenCalledWith(
           'Error',
           expect.stringContaining('corrupted')
         );
         expect(result.current.isModelDownloaded).toBe(false);
      });
    });

    it('successfully downloads model with correct size and hash', async () => {
        // Mock download success
        const mockDownloadAsync = jest.fn().mockResolvedValue({ uri: 'file:///path/to/model.gguf' });
        (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue({
          downloadAsync: mockDownloadAsync,
        });

        // Mock getInfoAsync: Correct size
        (FileSystem.getInfoAsync as jest.Mock)
          .mockResolvedValueOnce({ exists: false })
          .mockResolvedValueOnce({ exists: true, size: MODEL_SIZE_BYTES });

        // Mock RNFS.hash: Correct hash
        (RNFS.hash as jest.Mock).mockResolvedValue(CORRECT_HASH);

        const { result } = renderHook(() => useChatbot());

        // Trigger download
        await act(async () => {
          await result.current.downloadModel();
        });

        await waitFor(() => {
           expect(RNFS.hash).toHaveBeenCalled();
           expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
           expect(Alert.alert).toHaveBeenCalledWith(
             'Success',
             expect.stringContaining('successfully')
           );
           expect(result.current.isModelDownloaded).toBe(true);
        });
      });

  it('uses secure Llama 3 prompt format', async () => {
    const mockCompletion = jest.fn().mockResolvedValue({ text: 'Response' });
    (initLlama as jest.Mock).mockResolvedValue({
      completion: mockCompletion,
    });

    // Mock model exists (for checkModelExists)
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      size: MODEL_SIZE_BYTES
    });

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
});
