import { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { validateInputLength, sanitizeInput, sanitizePromptInput, containsSuspiciousPatterns, MAX_INPUT_LENGTH } from '@/utils/validation';

// Web implementation using a simple heuristic or placeholder
// Real local LLM on web (transformers.js) requires significant build config changes in Expo (metro/webpack) for WASM/Workers.
// Given constraints, we provide a "Lite" version for web.

export function useChatbot() {
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

  const handleChat = useCallback(async (questionText: string): Promise<boolean> => {
    // Web implementation does not use Keyboard.dismiss() the same way, but it's safe to call if using react-native-web
    try {
        Keyboard.dismiss();
    } catch {}

    // Security Validation
    let textToAsk = sanitizeInput(questionText);
    // Prevent prompt injection by removing role markers
    textToAsk = sanitizePromptInput(textToAsk);

    if (!textToAsk) return false;

    if (!validateInputLength(textToAsk, MAX_INPUT_LENGTH)) {
      if (typeof window !== 'undefined') window.alert(`Please limit your question to ${MAX_INPUT_LENGTH} characters.`);
      return false;
    }

    if (containsSuspiciousPatterns(textToAsk)) {
      if (typeof window !== 'undefined') window.alert("Your input contains invalid characters or patterns.");
      return false;
    }

    setIsLoading(true);
    setResponse('');

    // Simulate delay
    return new Promise((resolve) => {
      setTimeout(() => {
          setResponse("Web support for Local AI is currently limited. Please use the mobile app for the full offline AI experience.\n\nHowever, generalized advice: For cramps, try heat and hydration. For cycle tracking, consistency is key.");
          setIsLoading(false);
          resolve(true);
      }, 1500);
    });
  }, []); // Stable callback with no dependencies

  return {
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
