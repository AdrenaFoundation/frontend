/**
 * Debug utilities for development logging
 */

// Enable debug logging only in development
// Reduce debug noise - only enable when explicitly needed
export const DEBUG_WALLET = false; // process.env.NODE_ENV === 'development';
export const DEBUG_JUPITER = false; // process.env.NODE_ENV === 'development';
export const DEBUG_PRIVY = false; // process.env.NODE_ENV === 'development';

/**
 * Debug logger for wallet operations
 */
export function debugWallet(message: string, data?: unknown) {
  if (DEBUG_WALLET) {
    console.log(`🔍 WALLET: ${message}`, data);
  }
}

/**
 * Debug logger for Jupiter operations
 */
export function debugJupiter(message: string, data?: unknown) {
  if (DEBUG_JUPITER) {
    console.log(`🔍 JUPITER: ${message}`, data);
  }
}

/**
 * Debug logger for Privy operations
 */
export function debugPrivy(message: string, data?: unknown) {
  if (DEBUG_PRIVY) {
    console.log(`🔍 PRIVY: ${message}`, data);
  }
}

/**
 * Success logger (always shown)
 */
export function logSuccess(message: string, data?: unknown) {
  console.log(`✅ ${message}`, data);
}

/**
 * Error logger (always shown)
 */
export function logError(message: string, error?: unknown) {
  console.error(`❌ ${message}`, error);
}

/**
 * Warning logger (always shown)
 */
export function logWarning(message: string, data?: unknown) {
  console.warn(`⚠️ ${message}`, data);
}
