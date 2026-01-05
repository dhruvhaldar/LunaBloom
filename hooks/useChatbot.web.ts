import { useState } from 'react';
import { Keyboard } from 'react-native';

// Web implementation using a simple heuristic or placeholder
// Real local LLM on web (transformers.js) requires significant build config changes in Expo (metro/webpack) for WASM/Workers.
// Given constraints, we provide a "Lite" version for web.

export function useChatbot() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Web is always "ready" but has limited capability
  const isModelDownloaded = true;
  const isDownloading = false;
  const downloadProgress = 1;
  const isInitializing = false;
  const isReady = true;

  const downloadModel = async () => {};
  const initializeLlama = async () => {};

  const handleChat = async (questionText?: string) => {
    // Web implementation does not use Keyboard.dismiss() the same way, but it's safe to call if using react-native-web
    try {
        Keyboard.dismiss();
    } catch (e) {}

    const textToAsk = typeof questionText === 'string' ? questionText : question;
    if (!textToAsk.trim()) return;

    if (typeof questionText === 'string') {
      setQuestion(questionText);
    }

    setIsLoading(true);
    setResponse('');

    // Simulate delay
    setTimeout(() => {
        setResponse("Web support for Local AI is currently limited. Please use the mobile app for the full offline AI experience.\n\nHowever, generalized advice: For cramps, try heat and hydration. For cycle tracking, consistency is key.");
        setIsLoading(false);
    }, 1500);
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
    isReady,
    handleChat,
  };
}
