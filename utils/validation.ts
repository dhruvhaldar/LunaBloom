/**
 * Validates and sanitizes user input for security and data integrity.
 */

// Constants for validation limits
export const MAX_INPUT_LENGTH = 500;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_SYMPTOM_LENGTH = 50;
export const MAX_FLOW_LENGTH = 20;
export const MAX_SYMPTOMS_COUNT = 50;
export const MAX_CYCLE_LENGTH_DAYS = 365;
export const MAX_BACKUP_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
 * Sanitizes input specifically for LLM prompts to prevent injection attacks.
 * Neutralizes reserved keywords like 'User:', 'System:', 'Assistant:' which could
 * override the prompt structure/roles.
 * @param text The input text.
 * @returns The sanitized text.
 */
export const sanitizePromptInput = (text: string): string => {
  if (!text) return '';

  // Remove Llama 3 special tokens to prevent prompt injection.
  // These tokens are used to define roles (System, User, Assistant) and control flow.
  // Using a regex to match the <|...|> pattern specifically for known Llama 3 tokens.
  const llamaSpecialTokens = /<\|(begin_of_text|end_of_text|start_header_id|end_header_id|eot_id|python_tag)\|>/gi;
  let sanitized = text.replace(llamaSpecialTokens, '');

  // Replace reserved keywords at start of string or after newline with a safe alternative.
  // We use a regex with case insensitivity and multiline check.
  // Replaces "System:" with "[Role Redacted]:" to prevent role spoofing.
  sanitized = sanitized
    .replace(/(^|[\r\n]+)(User|System|Assistant):/gim, '$1[Role Redacted]:')
    .trim();

  return sanitized;
};

const DANGEROUS_PROTOCOLS = [
    /javascript:/im,
    /vbscript:/im,
    /data:text\/html/im,
];

// Defense-in-depth: Check for common XSS vectors and malicious patterns.
// Note: This is not a complete XSS filter but catches common attempts.
// Optimization: Define patterns once to avoid recreation on every validation call.
// Global flag 'g' is removed to keep regexes stateless for shared use.
const SUSPICIOUS_PATTERNS = [
    /<script\b[^>]*>([\s\S]*?)<\/script>/im,
    ...DANGEROUS_PROTOCOLS,
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
    // 1. Check original text against all patterns
    if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text))) {
        return true;
    }

    // 2. Normalize: remove all whitespace and control characters
    const normalized = text.replace(/[\s\x00-\x1F]/g, '');

    // 3. Check for dangerous protocols in normalized text to detect obfuscation
    // (e.g. "j a v a s c r i p t :")
    return DANGEROUS_PROTOCOLS.some(pattern => pattern.test(normalized));
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
  const timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
};

export const isValidBackupEntry = (entry: any): boolean => {
  if (typeof entry !== 'object' || entry === null) return false;

  // Required fields must exist and be of correct type
  if (typeof entry.date !== 'string' || !isValidDate(entry.date)) return false;

  // lastPeriod could be ISO string
  if (typeof entry.lastPeriod !== 'string' || !isValidDate(entry.lastPeriod)) return false;

  // cycleLength validation (number or string representation of number)
  let cLength = entry.cycleLength;
  if (typeof cLength === 'string') {
    if (cLength.length > 10) return false; // Fast fail for unreasonably long strings
    cLength = parseInt(cLength, 10);
  }
  // Must be a valid number within reasonable range
  if (typeof cLength !== 'number' || isNaN(cLength) || cLength < 0 || cLength > MAX_CYCLE_LENGTH_DAYS) return false;

  // selectedSymptoms validation
  if (!Array.isArray(entry.selectedSymptoms)) return false;
  if (entry.selectedSymptoms.length > MAX_SYMPTOMS_COUNT) return false; // Prevent array bomb
  if (!entry.selectedSymptoms.every((s: any) =>
      typeof s === 'string' &&
      s.length <= MAX_SYMPTOM_LENGTH &&
      !containsSuspiciousPatterns(s)
  )) return false;

  // selectedFlow validation (optional, can be null)
  if (entry.selectedFlow !== null && entry.selectedFlow !== undefined) {
      if (typeof entry.selectedFlow !== 'string') return false;
      if (entry.selectedFlow.length > MAX_FLOW_LENGTH) return false;
      if (containsSuspiciousPatterns(entry.selectedFlow)) return false;
  }

  // notes must be string
  if (typeof entry.notes !== 'string') return false;

  // Security checks on content
  if (entry.notes.length > MAX_NOTES_LENGTH) return false;
  if (containsSuspiciousPatterns(entry.notes)) return false;

  return true;
};

/**
 * Safely parses a JSON string into an array of period entries.
 * Returns an empty array if parsing fails or result is not an array.
 * @param json The JSON string to parse.
 * @returns Array of entries.
 */
export const parseSafePeriodEntries = (json: string | null): any[] => {
  if (!json) return [];
  try {
    const entries = JSON.parse(json);
    if (!Array.isArray(entries)) return [];
    // Security: Filter out any entries that don't match the expected schema
    return entries.filter(isValidBackupEntry);
  } catch {
    return [];
  }
};
