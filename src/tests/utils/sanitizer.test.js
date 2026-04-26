import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeCurrency } from '../../utils/sanitizer.js';

describe('sanitizer', () => {
  it('strips HTML from input strings', () => {
    const input = '<script>alert("xss")</script>Hello <b>World</b>';
    const output = sanitizeInput(input);
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('<b>');
    expect(output).toBe('alert("xss")Hello World');
  });

  it('rejects strings over 500 characters', () => {
    const longString = 'a'.repeat(600);
    const output = sanitizeInput(longString);
    expect(output.length).toBe(500);
  });

  it('sanitizeCurrency rejects values over 7000000', () => {
    const output = sanitizeCurrency(8000000);
    expect(output).toBe(7000000);
  });

  it('sanitizeCurrency rejects negative values', () => {
    const output = sanitizeCurrency(-500);
    expect(output).toBe(0);
  });

  it('handles null and undefined safely', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeCurrency(null)).toBe(0);
    expect(sanitizeCurrency(undefined)).toBe(0);
  });
});
