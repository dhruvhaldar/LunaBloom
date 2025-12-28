export const MAX_QUESTION_LENGTH = 500;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export const validateChatInput = (input: string): ValidationResult => {
  if (!input) return { isValid: false, error: 'Input is empty' };

  const sanitized = input.trim();
  if (sanitized.length === 0) return { isValid: false, error: 'Input is empty' };

  if (sanitized.length > MAX_QUESTION_LENGTH) {
    return {
      isValid: false,
      error: `Question too long. Please limit to ${MAX_QUESTION_LENGTH} characters.`
    };
  }

  return { isValid: true, sanitized };
};
