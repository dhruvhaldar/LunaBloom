/**
 * Validates the chatbot input.
 * @param input The user's input string.
 * @returns An object containing `isValid` boolean and an optional `error` message.
 */
export const validateChatInput = (input: string): { isValid: boolean; error?: string } => {
  const trimmedInput = input.trim();
  const MAX_LENGTH = 500;

  if (!trimmedInput) {
    return { isValid: false, error: 'Input cannot be empty.' };
  }

  if (trimmedInput.length > MAX_LENGTH) {
    return {
      isValid: false,
      error: `Input exceeds the maximum length of ${MAX_LENGTH} characters.`,
    };
  }

  return { isValid: true };
};
