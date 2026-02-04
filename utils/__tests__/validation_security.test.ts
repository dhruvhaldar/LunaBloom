import { containsSuspiciousPatterns } from '../validation';

describe('Security Validation Bypass', () => {
  it('SHOULD detect obfuscated event handlers (currently failing)', () => {
    // This represents an obfuscated XSS vector: "onload = alert(1)" with spaces
    const obfuscatedXSS = 'o n l o a d = alert(1)';

    // CURRENT BEHAVIOR: Returns false (safe) because normalization only checks protocols
    // DESIRED BEHAVIOR: Returns true (unsafe)
    expect(containsSuspiciousPatterns(obfuscatedXSS)).toBe(true);
  });

  it('SHOULD detect obfuscated script tags (currently failing)', () => {
      // This represents "<script>..." with spaces
      // Note: "s c r i p t" creates "script".
      // < s c r i p t > -> <script>
      const obfuscatedScript = '< s c r i p t > alert(1) < / s c r i p t >';
      expect(containsSuspiciousPatterns(obfuscatedScript)).toBe(true);
  });
});
