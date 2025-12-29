import { validateChatInput } from '../validation';

describe('validateChatInput', () => {
  it('should return valid for normal input', () => {
    const result = validateChatInput('Hello, how are you?');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty input', () => {
    const result = validateChatInput('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Input cannot be empty.');
  });

  it('should return invalid for input exceeding max length', () => {
    const longInput = 'a'.repeat(501);
    const result = validateChatInput(longInput);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Input exceeds the maximum length');
  });

  it('should return valid for input exactly at max length', () => {
    const maxInput = 'a'.repeat(500);
    const result = validateChatInput(maxInput);
    expect(result.isValid).toBe(true);
  });
});
