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

// Defense-in-depth: Check for common XSS vectors and malicious patterns.
// Note: This is not a complete XSS filter but catches common attempts.
// Optimization: Define patterns once to avoid recreation on every validation call.
// Global flag 'g' is removed to keep regexes stateless for shared use.
const SUSPICIOUS_PATTERNS = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/im,
    /javascript:/im,
    /vbscript:/im,
    /data:text\/html/im,
    // Common dangerous event handlers (using word boundaries to avoid false positives)
    /\bonload\s*=/im,
    /\bonerror\s*=/im,
    /\bonclick\s*=/im,
    /\bonmouseover\s*=/im,
    /\bonfocus\s*=/im,
    /\bonblur\s*=/im,
    /\bonsubmit\s*=/im,
    // HTML tags that can execute code or load external resources
    /<\/?iframe\b[^>]*>/im,
    /<\/?object\b[^>]*>/im,
    /<\/?embed\b[^>]*>/im,
    /<\/?applet\b[^>]*>/im,
    /<\/?meta\b[^>]*>/im
];

/**
 * Checks if the text contains potentially dangerous patterns (basic check).
 * @param text The text to check.
 * @returns True if the text contains suspicious patterns.
 */
export const containsSuspiciousPatterns = (text: string): boolean => {
    return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));
};

/**
 * Validates a backup entry object against the expected schema.
 * @param entry The entry object to validate.
 * @returns True if the entry is valid and safe.
 */
/**
 * Helper to validate date strings.
 * @param dateString The string to check.
 * @returns True if it's a valid date string.
 */
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isValidBackupEntry = (entry: any): boolean => {
  if (typeof entry !== 'object' || entry === null) return false;

  // Required fields must exist and be of correct type
  if (typeof entry.date !== 'string' || !isValidDate(entry.date)) return false;

  // lastPeriod could be ISO string
  if (typeof entry.lastPeriod !== 'string' || !isValidDate(entry.lastPeriod)) return false;

  // cycleLength can be string or number (based on legacy data)
  if (typeof entry.cycleLength !== 'string' && typeof entry.cycleLength !== 'number') return false;

  // selectedSymptoms must be array of strings
  if (!Array.isArray(entry.selectedSymptoms)) return false;
  if (!entry.selectedSymptoms.every((s: any) => typeof s === 'string')) return false;

  // notes must be string
  if (typeof entry.notes !== 'string') return false;

  // Security checks on content
  if (entry.notes.length > MAX_NOTES_LENGTH) return false;
  if (containsSuspiciousPatterns(entry.notes)) return false;

  // Optional: Check other fields if critical, but these are the core ones
  // If we wanted to be strict, we'd check everything, but backward compatibility is important.

  return true;
};
