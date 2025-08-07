/**
 * Environment Variables Configuration
 * 
 * This file provides type-safe access to environment variables
 * with optional fallbacks for development.
 */

// =============================================================================
// ENVIRONMENT GETTERS
// =============================================================================

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Get optional environment variable
 */
export function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  return value === 'true' || value === '1' || fallback;
}

/**
 * Get number environment variable
 */
export function getNumberEnvVar(key: string, fallback: number = 0): number {
  const value = process.env[key];
  const num = parseInt(value || fallback.toString(), 10);
  return isNaN(num) ? fallback : num;
}

// =============================================================================
// CONVENIENCE GETTERS
// =============================================================================

export const env = {
  // App Configuration (with fallbacks)
  appName: () => getEnvVar('NEXT_PUBLIC_APP_NAME', 'Game Arena'),
  appVersion: () => getEnvVar('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  appUrl: () => getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  apiUrl: () => getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
  
  // Development
  isDevelopment: () => getEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: () => getEnvVar('NODE_ENV', 'development') === 'production',
  isTest: () => getEnvVar('NODE_ENV', 'development') === 'test',
  debug: () => getBooleanEnvVar('DEBUG', false),
  
  // Game Configuration
  enableGameStats: () => getBooleanEnvVar('NEXT_PUBLIC_ENABLE_GAME_STATS', true),
};

export default env; 