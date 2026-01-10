import { validateInputLength, sanitizeInput, containsSuspiciousPatterns, isValidBackupEntry, MAX_INPUT_LENGTH, MAX_NOTES_LENGTH } from '../validation';

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

    it('should detect event handlers', () => {
        expect(containsSuspiciousPatterns('<div onclick="alert(1)">')).toBe(true);
        expect(containsSuspiciousPatterns('onload=alert(1)')).toBe(true);
        expect(containsSuspiciousPatterns('ONMOUSEOVER=alert(1)')).toBe(true); // Case insensitive
    });

    it('should detect iframes', () => {
        expect(containsSuspiciousPatterns('<iframe src="http://evil.com"></iframe>')).toBe(true);
        expect(containsSuspiciousPatterns('<IFRAME src="http://evil.com">')).toBe(true);
    });

    it('should detect object and embed', () => {
        expect(containsSuspiciousPatterns('<object data="malicious.swf"></object>')).toBe(true);
        expect(containsSuspiciousPatterns('<embed src="malicious.swf">')).toBe(true);
    });

    it('should detect meta refresh', () => {
        expect(containsSuspiciousPatterns('<meta http-equiv="refresh" content="0;url=http://evil.com">')).toBe(true);
    });

    it('should return false for safe text', () => {
      expect(containsSuspiciousPatterns('Hello world')).toBe(false);
      expect(containsSuspiciousPatterns('This is a test note.')).toBe(false);
      expect(containsSuspiciousPatterns('Dates: 2023-01-01')).toBe(false);
    });

    it('should not flag innocent text containing "on"', () => {
        expect(containsSuspiciousPatterns('json data')).toBe(false);
        expect(containsSuspiciousPatterns('one day')).toBe(false);
        expect(containsSuspiciousPatterns('done deal')).toBe(false);
        expect(containsSuspiciousPatterns('phone call')).toBe(false);
        expect(containsSuspiciousPatterns('Only you')).toBe(false);
    });
  });

  describe('isValidBackupEntry', () => {
    const validEntry = {
      date: '2023-01-01T00:00:00.000Z',
      lastPeriod: '2023-01-01T00:00:00.000Z',
      cycleLength: 28,
      selectedSymptoms: ['Cramps'],
      notes: 'Some notes'
    };

    it('should return true for a valid entry', () => {
      expect(isValidBackupEntry(validEntry)).toBe(true);
    });

    it('should allow cycleLength as string', () => {
      const entry = { ...validEntry, cycleLength: '28' };
      expect(isValidBackupEntry(entry)).toBe(true);
    });

    it('should return false if date is missing', () => {
      const { date, ...invalidEntry } = validEntry;
      expect(isValidBackupEntry(invalidEntry)).toBe(false);
    });

    it('should return false if lastPeriod is not string', () => {
      const entry = { ...validEntry, lastPeriod: 123 };
      expect(isValidBackupEntry(entry)).toBe(false);
    });

    it('should return false if selectedSymptoms is not array', () => {
      const entry = { ...validEntry, selectedSymptoms: 'Cramps' };
      expect(isValidBackupEntry(entry)).toBe(false);
    });

    it('should return false if notes is not string', () => {
      const entry = { ...validEntry, notes: null };
      expect(isValidBackupEntry(entry)).toBe(false);
    });

    it('should return false if notes contains suspicious patterns', () => {
      const entry = { ...validEntry, notes: 'Hello <script>alert(1)</script>' };
      expect(isValidBackupEntry(entry)).toBe(false);
    });

    it('should return false if notes is too long', () => {
      const entry = { ...validEntry, notes: 'a'.repeat(MAX_NOTES_LENGTH + 1) };
      expect(isValidBackupEntry(entry)).toBe(false);
    });

    it('should return false for non-object input', () => {
      expect(isValidBackupEntry(null)).toBe(false);
      expect(isValidBackupEntry('string')).toBe(false);
    });
  });
});
