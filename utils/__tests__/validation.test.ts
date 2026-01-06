import { validateInputLength, sanitizeInput, containsSuspiciousPatterns, MAX_INPUT_LENGTH } from '../validation';

describe('Validation Utils', () => {
  describe('validateInputLength', () => {
    it('should return true for input within limit', () => {
      expect(validateInputLength('abc', 5)).toBe(true);
    });

    it('should return false for input exceeding limit', () => {
      expect(validateInputLength('abcdef', 5)).toBe(false);
    });

    it('should use default MAX_INPUT_LENGTH if not provided', () => {
      const longString = 'a'.repeat(MAX_INPUT_LENGTH + 1);
      expect(validateInputLength(longString)).toBe(false);
      expect(validateInputLength('a'.repeat(MAX_INPUT_LENGTH))).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should remove control characters', () => {
      // \x00 is null, \x1F is unit separator
      expect(sanitizeInput('hello\x00world')).toBe('helloworld');
    });

    it('should preserve newlines', () => {
      expect(sanitizeInput('hello\nworld')).toBe('hello\nworld');
    });
  });

  describe('containsSuspiciousPatterns', () => {
    it('should detect script tags', () => {
      expect(containsSuspiciousPatterns('<script>alert(1)</script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsSuspiciousPatterns('javascript:alert(1)')).toBe(true);
    });

    it('should return false for safe text', () => {
      expect(containsSuspiciousPatterns('Hello world')).toBe(false);
    });
  });
});
