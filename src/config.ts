/**
 * Application configuration
 * Uses Vite environment variables
 */

/**
 * Base URL for the LiveBoard API
 * Defaults to localhost for local development
 * Override with VITE_API_URL environment variable for production
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";
