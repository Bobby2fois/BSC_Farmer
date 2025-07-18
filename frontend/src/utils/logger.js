/**
 * Logging utility for CornMiner BSC
 * Conditionally logs based on environment
 */

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Development-only logging
 * Only outputs in development environment
 */
export const devLog = (...args) => {
  if (isDev) console.log(...args);
};

/**
 * Always logs regardless of environment
 * Use for critical information that should always be visible
 */
export const alwaysLog = (...args) => {
  console.log(...args);
};

/**
 * Transaction logging
 * Always logs transaction-related information (important for blockchain apps)
 */
export const txLog = (...args) => {
  console.log('[TRANSACTION]', ...args);
};

/**
 * Error logging
 * Always logs errors with enhanced formatting
 */
export const errorLog = (...args) => {
  console.error('[ERROR]', ...args);
};

/**
 * Warning logging
 * Always logs warnings
 */
export const warnLog = (...args) => {
  console.warn('[WARNING]', ...args);
};

export default {
  devLog,
  alwaysLog,
  txLog,
  errorLog,
  warnLog
};
