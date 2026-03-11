import { useState, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { validateInputLength, sanitizeInput, sanitizePromptInput, containsSuspiciousPatterns, MAX_INPUT_LENGTH } from '@/utils/validation';

// Web implementation using a simple heuristic or placeholder
// Real local LLM on web (transformers.js) requires significant build config changes in Expo (metro/webpack) for WASM/Workers.
// Given constraints, we provide a "Lite" version for web.

export function useChatbot() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Security: Rate limiting to prevent DoS/spam
  const lastRequestTime = useRef(0);
  const MIN_REQUEST_INTERVAL = 2000; // 2 seconds

  // Web is always "ready" but has limited capability
  const isModelDownloaded = true;
  const isDownloading = false;
  const downloadProgress = 1;
  const isInitializing = false;
  const isReady = true;

  const downloadModel = async () => {};
  const initializeLlama = async () => {};

  const handleChat = useCallback(async (questionText: string) => {
    // Web implementation does not use Keyboard.dismiss() the same way, but it's safe to call if using react-native-web
    try {
        Keyboard.dismiss();
    } catch {}

    // Security: Enforce rate limiting
    const now = Date.now();
    if (now - lastRequestTime.current < MIN_REQUEST_INTERVAL) {
      if (typeof window !== 'undefined') {
        window.alert("Slow down! Please wait a moment before sending another message.");
      }
      return;
    }
    lastRequestTime.current = now;

    let textToAsk = questionText;

    // Security Validation
    textToAsk = sanitizeInput(textToAsk);
    // Prevent prompt injection by removing role markers
    textToAsk = sanitizePromptInput(textToAsk);

    if (!textToAsk) return;

    if (!validateInputLength(textToAsk, MAX_INPUT_LENGTH)) {
      if (typeof window !== 'undefined') window.alert(`Please limit your question to ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    if (containsSuspiciousPatterns(textToAsk)) {
      if (typeof window !== 'undefined') window.alert("Your input contains invalid characters or patterns.");
      return;
    }

    setIsLoading(true);
    setResponse('');

    // Simulate delay
    setTimeout(() => {
        setResponse("Web support for Local AI is currently limited. Please use the mobile app for the full offline AI experience.\n\nHowever, generalized advice: For cramps, try heat and hydration. For cycle tracking, consistency is key.");
        setIsLoading(false);
    }, 1500);
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
