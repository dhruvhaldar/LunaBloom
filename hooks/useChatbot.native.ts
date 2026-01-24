import { useState, useEffect, useCallback, useRef } from 'react';
import { Keyboard, Alert } from 'react-native';
import { initLlama, LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import { validateInputLength, sanitizeInput, sanitizePromptInput, containsSuspiciousPatterns, MAX_INPUT_LENGTH } from '@/utils/validation';

const MODEL_URL = 'https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-1b-instruct-q4_k_m.gguf';
const MODEL_FILENAME = 'llama-3.2-1b-instruct-q4_k_m.gguf';
const MODEL_PATH = `${FileSystem.documentDirectory}${MODEL_FILENAME}`;
const MODEL_SIZE_BYTES = 807690656; // Expected size from HF (exact bytes)
const MODEL_SHA256 = '1d0e9419ec4e12aef73ccf4ffd122703e94c48344a96bc7c5f0f2772c2152ce3';

export function useChatbot() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ref to track question state for stable handleChat callback
  const questionRef = useRef(question);
  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    checkModelExists();
  }, []);

  const verifyModelIntegrity = async (path: string, expectedSize: number): Promise<boolean> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (!fileInfo.exists) return false;

      // 1. Check File Size
      if (fileInfo.size !== expectedSize) {
        console.error(`Model size mismatch: expected ${expectedSize}, got ${fileInfo.size}`);
        return false;
      }

      // 2. Check SHA-256 Hash
      // RNFS requires stripping 'file://' prefix on some platforms (like Android)
      const cleanPath = path.startsWith('file://') ? path.slice(7) : path;
      const fileHash = await RNFS.hash(cleanPath, 'sha256');

      if (fileHash.toLowerCase() !== MODEL_SHA256.toLowerCase()) {
        console.error(`Model hash mismatch: expected ${MODEL_SHA256}, got ${fileHash}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Integrity verification error:", error);
      return false;
    }
  };

  const checkModelExists = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH);
      if (fileInfo.exists) {
        // Optimization: Only check size on startup to avoid expensive hashing operation.
        // Full integrity check (SHA-256) is performed immediately after download.
        if (fileInfo.size !== MODEL_SIZE_BYTES) {
          console.error(`Model size mismatch: expected ${MODEL_SIZE_BYTES}, got ${fileInfo.size}. Deleting corrupted file.`);
          await FileSystem.deleteAsync(MODEL_PATH, { idempotent: true });
          setIsModelDownloaded(false);
          Alert.alert("Integrity Check Failed", "The downloaded model was corrupted and has been deleted. Please download it again.");
        } else {
          setIsModelDownloaded(true);
        }
      }
    } catch (error) {
      console.error('Error checking model existence:', error instanceof Error ? error.message : String(error));
    }
  };

  const downloadModel = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
      };

      const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_URL,
        MODEL_PATH,
        {},
        callback
      );

      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        // Security/Integrity Check: Verify file size and hash immediately after download
        const isValid = await verifyModelIntegrity(MODEL_PATH, MODEL_SIZE_BYTES);

        if (isValid) {
          setIsModelDownloaded(true);
          Alert.alert("Success", "Model downloaded successfully!");
        } else {
          console.error(`Download integrity check failed.`);
          // Clean up corrupted file
          await FileSystem.deleteAsync(MODEL_PATH, { idempotent: true });
          setIsModelDownloaded(false);
          Alert.alert("Error", "Model downloaded but seems corrupted. Please try again.");
        }
      }
    } catch (error) {
      console.error('Error downloading model:', error instanceof Error ? error.message : String(error));
      Alert.alert("Error", "Failed to download the model. Please check your internet connection.");
    } finally {
      setIsDownloading(false);
    }
  };

  const initializeLlama = async () => {
    if (!isModelDownloaded) return;
    setIsInitializing(true);
    try {
      const context = await initLlama({
        model: MODEL_PATH,
        use_mlock: true,
        n_gpu_layers: 0,
      });
      setLlamaContext(context);
    } catch (error) {
      console.error('Error initializing Llama:', error instanceof Error ? error.message : String(error));
      Alert.alert("Error", "Failed to initialize the AI model.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleChat = useCallback(async (questionText?: string) => {
    Keyboard.dismiss();
    // Use ref to access latest state without adding it to dependency array
    let textToAsk = typeof questionText === 'string' ? questionText : questionRef.current;

    // Security Validation
    textToAsk = sanitizeInput(textToAsk);
    // Prevent prompt injection by removing role markers
    textToAsk = sanitizePromptInput(textToAsk);

    if (!textToAsk) return;

    if (!validateInputLength(textToAsk, MAX_INPUT_LENGTH)) {
      Alert.alert("Input too long", `Please limit your question to ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    if (containsSuspiciousPatterns(textToAsk)) {
      Alert.alert("Invalid Input", "Your input contains invalid characters or patterns.");
      return;
    }

    if (typeof questionText === 'string') {
      setQuestion(textToAsk);
    }

    if (!llamaContext) {
      Alert.alert("AI Not Ready", "Please load the AI model first.");
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      // Security Enhancement: Use Llama 3 special tokens to enforce role separation
      // and prevent prompt injection (user cannot break out of 'user' role).
      const systemPrompt = "You are a helpful women's health expert assistant. Answer concisely in 3 lines or less. Focus on period-based advice.";
      const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${textToAsk}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

      const result = await llamaContext.completion(
        {
          prompt,
          n_predict: 100,
          stop: ["<|eot_id|>", "<|end_of_text|>"],
        },
        (data) => {
          // Streaming callback if needed
        }
      );

      setResponse(result.text.trim());
    } catch (error) {
      console.error('Llama Error:', error instanceof Error ? error.message : String(error));
      setResponse('Error generating response.');
    } finally {
      setIsLoading(false);
    }
  }, [llamaContext]); // Only recreate if llamaContext changes

  return {
    question,
    setQuestion,
    response,
    isLoading,
    isModelDownloaded,
    isDownloading,
    downloadProgress,
    downloadModel,
    isInitializing,
    initializeLlama,
    isReady: !!llamaContext,
    handleChat,
  };
}
