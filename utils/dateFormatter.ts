const formatters = new Map<string, Intl.DateTimeFormat>();

// Standard 'en-GB' formatters commonly used in the app
export const DateFormats = {
  ShortDate: { day: 'numeric', month: 'short', year: 'numeric' } as const, // "1 Jan 2024"
  MonthDay: { day: 'numeric', month: 'short' } as const, // "1 Jan"
};

// Optimization: Pre-calculate keys for known formats to avoid JSON.stringify on every call
// This is O(1) lookup vs O(N) serialization
const knownKeys = new Map<object, string>();
knownKeys.set(DateFormats.ShortDate, JSON.stringify(DateFormats.ShortDate));
knownKeys.set(DateFormats.MonthDay, JSON.stringify(DateFormats.MonthDay));

/**
 * Formats a date string or object using cached Intl.DateTimeFormat instances.
 * This is significantly faster than calling toLocaleDateString() repeatedly in loops or lists.
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = DateFormats.ShortDate,
  locale: string = 'en-GB'
): string => {
  // Handle invalid dates gracefully if needed, or let it throw
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // Optimization: Cache Intl.DateTimeFormat instances to avoid expensive re-creation
  // Check fast path for known options objects (reference equality)
  let optionsKey = knownKeys.get(options);

  if (!optionsKey) {
     // Fallback to serialization for custom options
     optionsKey = JSON.stringify(options);
  }

  const key = `${locale}-${optionsKey}`;

  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, formatter);
  }

  return formatter.format(dateObj);
};
