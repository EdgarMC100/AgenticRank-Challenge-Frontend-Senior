import type { Order, Filters } from "../types";

/**
 * Checks if an order matches the given filter criteria
 * @param order - The order to check
 * @param filters - The filter criteria to apply
 * @returns true if the order matches all active filters
 */
export function matchesFilters(order: Order, filters: Filters): boolean {
  // Restaurant filter - exact match
  if (filters.restaurantName && order.restaurantName !== filters.restaurantName) {
    return false;
  }

  // Status filter - must match one of the selected statuses
  if (filters.statuses.length > 0 && !filters.statuses.includes(order.status.kind)) {
    return false;
  }

  // Search query - case-insensitive search across customer name, restaurant name, and items
  if (filters.query.trim() !== "") {
    const q = filters.query.toLowerCase();
    const inCustomer = order.customerName.toLowerCase().includes(q);
    const inRestaurant = order.restaurantName.toLowerCase().includes(q);
    const inItems = order.items.some((it) => it.name.toLowerCase().includes(q));
    if (!inCustomer && !inRestaurant && !inItems) return false;
  }

  return true;
}

/**
 * Filters and sorts orders based on the given criteria
 * @param orders - The list of orders to filter
 * @param filters - The filter criteria to apply
 * @returns Filtered and sorted orders (sorted by total descending)
 */
export function filterAndSortOrders(orders: Order[], filters: Filters): Order[] {
  return orders
    .filter((o) => matchesFilters(o, filters))
    .sort((a, b) => b.total - a.total);
}
