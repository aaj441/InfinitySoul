/**
 * Number Parser Utilities
 * 
 * Safely parse numbers from strings that may contain:
 * - Ranges (e.g., "1-10", "500K-2M")
 * - Formatted numbers (e.g., "500K", "2M", "1.5B")
 * - Plain numbers
 */

/**
 * Parse employee count from various formats
 * Handles: "5", "1-10", "11-50", "500+", etc.
 * @param input - The employee count string
 * @returns Midpoint of range or the number, or null if invalid
 */
export function parseEmployeeCount(input: string | number): number | null {
  if (typeof input === 'number') {
    return input;
  }
  
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim();
  
  // Handle "500+" format
  if (trimmed.endsWith('+')) {
    const num = parseInt(trimmed.slice(0, -1), 10);
    return isNaN(num) ? null : num;
  }
  
  // Handle range format "1-10", "11-50", etc.
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map(p => parseInt(p.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      // Return midpoint of range
      return Math.floor((parts[0] + parts[1]) / 2);
    }
    return null;
  }
  
  // Handle plain number
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? null : num;
}

/**
 * Parse annual revenue from various formats
 * Handles: "1000000", "1M", "500K", "1.5B", "500K-2M", etc.
 * @param input - The revenue string
 * @returns Midpoint of range or the number, or null if invalid
 */
export function parseAnnualRevenue(input: string | number): number | null {
  if (typeof input === 'number') {
    return input;
  }
  
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim().toUpperCase();
  
  // Handle range format "500K-2M", "1M-10M", etc.
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map(p => parseRevenueValue(p.trim()));
    if (parts.length === 2 && parts[0] !== null && parts[1] !== null) {
      // Return midpoint of range
      return Math.floor((parts[0] + parts[1]) / 2);
    }
    return null;
  }
  
  // Handle single value
  return parseRevenueValue(trimmed);
}

/**
 * Parse a single revenue value (not a range)
 * Handles: "1000000", "1M", "500K", "1.5B", etc.
 * @param value - The revenue value string
 * @returns The numeric value or null if invalid
 */
function parseRevenueValue(value: string): number | null {
  if (!value) {
    return null;
  }
  
  const trimmed = value.trim().toUpperCase();
  
  // Handle suffixes
  const multipliers: Record<string, number> = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000,
  };
  
  // Check if value ends with K, M, or B
  const lastChar = trimmed.charAt(trimmed.length - 1);
  if (lastChar in multipliers) {
    const numPart = trimmed.slice(0, -1);
    const num = parseFloat(numPart);
    if (isNaN(num)) {
      return null;
    }
    return Math.floor(num * multipliers[lastChar]);
  }
  
  // Handle plain number
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : Math.floor(num);
}

/**
 * Format a number with K/M/B suffix
 * @param value - The numeric value
 * @returns Formatted string
 */
export function formatRevenue(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * Parse a percentage string
 * Handles: "50%", "0.5", "50", etc.
 * @param input - The percentage string
 * @returns Decimal value (0.5 for 50%) or null if invalid
 */
export function parsePercentage(input: string | number): number | null {
  if (typeof input === 'number') {
    // If already a number between 0-1, assume it's a decimal
    if (input >= 0 && input <= 1) {
      return input;
    }
    // If > 1, assume it's a percentage (e.g., 50 for 50%)
    if (input > 1 && input <= 100) {
      return input / 100;
    }
    return null;
  }
  
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const trimmed = input.trim();
  
  // Handle percentage format "50%"
  if (trimmed.endsWith('%')) {
    const num = parseFloat(trimmed.slice(0, -1));
    if (isNaN(num)) {
      return null;
    }
    return num / 100;
  }
  
  // Handle plain number
  const num = parseFloat(trimmed);
  if (isNaN(num)) {
    return null;
  }
  
  // If between 0-1, assume it's already a decimal
  if (num >= 0 && num <= 1) {
    return num;
  }
  
  // If > 1, assume it's a percentage
  if (num > 1 && num <= 100) {
    return num / 100;
  }
  
  return null;
}

/**
 * Safely parse an integer with a default value
 * @param input - The input to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer or default value
 */
export function safeParseInt(input: string | number | undefined | null, defaultValue: number = 0): number {
  if (typeof input === 'number') {
    return Math.floor(input);
  }
  
  if (!input) {
    return defaultValue;
  }
  
  const parsed = parseInt(String(input), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a float with a default value
 * @param input - The input to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed float or default value
 */
export function safeParseFloat(input: string | number | undefined | null, defaultValue: number = 0): number {
  if (typeof input === 'number') {
    return input;
  }
  
  if (!input) {
    return defaultValue;
  }
  
  const parsed = parseFloat(String(input));
  return isNaN(parsed) ? defaultValue : parsed;
}
