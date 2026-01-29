import { formatDate, DateFormats } from '../dateFormatter';

describe('formatDate', () => {
  const TEST_DATE_ISO = '2024-01-15T10:00:00.000Z'; // Jan 15 2024
  const TEST_TIMESTAMP = 1705312800000; // 2024-01-15T10:00:00.000Z
  const TEST_DATE_OBJ = new Date(TEST_TIMESTAMP);

  // Expected output for en-GB locale
  const EXPECTED_SHORT_DATE = '15 Jan 2024';
  const EXPECTED_MONTH_DAY = '15 Jan';

  it('formats correctly using Date object', () => {
    expect(formatDate(TEST_DATE_OBJ, DateFormats.ShortDate)).toBe(EXPECTED_SHORT_DATE);
    expect(formatDate(TEST_DATE_OBJ, DateFormats.MonthDay)).toBe(EXPECTED_MONTH_DAY);
  });

  it('formats correctly using ISO string', () => {
    expect(formatDate(TEST_DATE_ISO, DateFormats.ShortDate)).toBe(EXPECTED_SHORT_DATE);
    expect(formatDate(TEST_DATE_ISO, DateFormats.MonthDay)).toBe(EXPECTED_MONTH_DAY);
  });

  it('formats correctly using timestamp number', () => {
    expect(formatDate(TEST_TIMESTAMP, DateFormats.ShortDate)).toBe(EXPECTED_SHORT_DATE);
    expect(formatDate(TEST_TIMESTAMP, DateFormats.MonthDay)).toBe(EXPECTED_MONTH_DAY);
  });

  it('handles invalid strings gracefully', () => {
    expect(formatDate('invalid-date')).toBe('Invalid Date');
  });

  it('handles invalid numbers gracefully', () => {
    expect(formatDate(NaN)).toBe('Invalid Date');
  });

  it('uses default options (ShortDate) if none provided', () => {
    expect(formatDate(TEST_DATE_OBJ)).toBe(EXPECTED_SHORT_DATE);
  });
});
