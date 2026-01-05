import { useState, useEffect } from 'react';
import { Keyboard, Alert } from 'react-native';
import { initLlama, LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system';

const MODEL_URL = 'https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-1b-instruct-q4_k_m.gguf';
const MODEL_FILENAME = 'llama-3.2-1b-instruct-q4_k_m.gguf';
const MODEL_PATH = `${FileSystem.documentDirectory}${MODEL_FILENAME}`;

export function useChatbot() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    checkModelExists();
  }, []);

  const checkModelExists = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH);
      if (fileInfo.exists) {
        setIsModelDownloaded(true);
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
        setIsModelDownloaded(true);
        Alert.alert("Success", "Model downloaded successfully!");
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

  const handleChat = async (questionText?: string) => {
    Keyboard.dismiss();
    const textToAsk = typeof questionText === 'string' ? questionText : question;
    if (!textToAsk.trim()) return;

    if (typeof questionText === 'string') {
      setQuestion(questionText);
    }

    if (!llamaContext) {
      Alert.alert("AI Not Ready", "Please load the AI model first.");
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const systemPrompt = "System: You are a helpful women's health expert assistant. Answer concisely in 3 lines or less. Focus on period-based advice.";
      const prompt = `${systemPrompt}\nUser: ${textToAsk}\nAssistant:`;

      const result = await llamaContext.completion(
        {
          prompt,
          n_predict: 100,
          stop: ["User:", "System:"],
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
  };

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
