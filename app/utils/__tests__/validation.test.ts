import { validateChatInput, MAX_QUESTION_LENGTH } from '../validation';

describe('validateChatInput', () => {
  it('should return valid for normal input', () => {
    const result = validateChatInput('Hello world');
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe('Hello world');
    expect(result.error).toBeUndefined();
  });

  it('should trim whitespace', () => {
    const result = validateChatInput('  Hello world  ');
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe('Hello world');
  });

  it('should return invalid for empty input', () => {
    const result = validateChatInput('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  it('should return invalid for whitespace-only input', () => {
    const result = validateChatInput('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  it('should return invalid for input exceeding max length', () => {
    const longInput = 'a'.repeat(MAX_QUESTION_LENGTH + 1);
    const result = validateChatInput(longInput);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Question too long');
  });

  it('should return valid for input exactly at max length', () => {
    const longInput = 'a'.repeat(MAX_QUESTION_LENGTH);
    const result = validateChatInput(longInput);
    expect(result.isValid).toBe(true);
    expect(result.sanitized).toBe(longInput);
  });
});
