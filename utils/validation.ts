/**
 * Validates and sanitizes user input for security and data integrity.
 */

// Constants for validation limits
export const MAX_INPUT_LENGTH = 500;
export const MAX_NOTES_LENGTH = 1000;

/**
 * Validates if the input text is within the allowed length.
 * @param text The input text to validate.
 * @param maxLength The maximum allowed length (default: 500).
 * @returns True if valid, false otherwise.
 */
export const validateInputLength = (text: string, maxLength: number = MAX_INPUT_LENGTH): boolean => {
  if (!text) return true; // Empty input is handled by other checks if needed
  return text.length <= maxLength;
};

/**
 * Sanitizes input text by trimming and removing control characters.
 * @param text The text to sanitize.
 * @returns The sanitized text.
 */
export const sanitizeInput = (text: string): string => {
  if (!text) return '';
  // Remove control characters (ASCII 0-31) except newlines (10) and carriage returns (13)
  // This helps prevent some forms of injection or display issues
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, '').trim();
};

/**
 * Checks if the text contains potentially dangerous patterns (basic check).
 * @param text The text to check.
 * @returns True if the text contains suspicious patterns.
 */
export const containsSuspiciousPatterns = (text: string): boolean => {
    // Basic check for script tags or common SQL injection patterns (though we don't use SQL)
    // This is a defense-in-depth measure.
    const suspiciousPatterns = [
        /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
        /javascript:/gim,
        /vbscript:/gim,
        /onload=/gim,
        /onerror=/gim
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
};
