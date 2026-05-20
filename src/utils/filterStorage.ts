import type { StatusKind } from "../types";

/**
 * LocalStorage key for persisting filter state
 */
export const FILTER_STORAGE_KEY = "liveboard-filters";

/**
 * Available order status options
 */
export const STATUS_OPTIONS: StatusKind[] = [
  "pending",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

/**
 * Shape of filters stored in localStorage
 */
export interface StoredFilters {
  query?: string;
  statuses?: StatusKind[];
  restaurantName?: string | null;
}

/**
 * Load filter state from localStorage
 * @returns Stored filters or empty object if not available
 */
export function loadFiltersFromStorage(): StoredFilters {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    // Return empty object if localStorage is unavailable or parsing fails
    return {};
  }
}

/**
 * Save filter state to localStorage
 * @param filters - Filter state to persist
 */
export function saveFiltersToStorage(filters: StoredFilters): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Silently fail if localStorage is not available
  }
}
