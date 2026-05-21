import { describe, expect, it } from "vitest";
import { matchesFilters, filterAndSortOrders } from "../utils/orderFilters";
import type { Order, Filters } from "../types";

const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "test-id",
  customerName: "John Doe",
  restaurantName: "Test Restaurant",
  items: [{ name: "Burger", quantity: 1, unitPrice: 1000 }],
  total: 1000,
  status: { kind: "pending", placedAt: "2024-01-01T12:00:00Z" },
  ...overrides,
});

describe("orderFilters", () => {
  describe("matchesFilters", () => {
    it("returns true when no filters are applied", () => {
      const order = createMockOrder();
      const filters: Filters = { query: "", statuses: [], restaurantName: null };

      expect(matchesFilters(order, filters)).toBe(true);
    });

    it("filters by restaurant name", () => {
      const order = createMockOrder({ restaurantName: "Pizza Place" });
      const filters: Filters = {
        query: "",
        statuses: [],
        restaurantName: "Pizza Place",
      };

      expect(matchesFilters(order, filters)).toBe(true);

      filters.restaurantName = "Burger Joint";
      expect(matchesFilters(order, filters)).toBe(false);
    });

    it("filters by order status", () => {
      const pendingOrder = createMockOrder({
        status: { kind: "pending", placedAt: "2024-01-01T12:00:00Z" },
      });
      const deliveredOrder = createMockOrder({
        status: {
          kind: "delivered",
          placedAt: "2024-01-01T12:00:00Z",
          startedAt: "2024-01-01T12:05:00Z",
          readyAt: "2024-01-01T12:15:00Z",
          deliveredAt: "2024-01-01T12:30:00Z",
        },
      });

      const filters: Filters = {
        query: "",
        statuses: ["pending"],
        restaurantName: null,
      };

      expect(matchesFilters(pendingOrder, filters)).toBe(true);
      expect(matchesFilters(deliveredOrder, filters)).toBe(false);
    });

    it("searches by customer name (case-insensitive)", () => {
      const order = createMockOrder({ customerName: "Alice Smith" });
      const filters: Filters = {
        query: "alice",
        statuses: [],
        restaurantName: null,
      };

      expect(matchesFilters(order, filters)).toBe(true);

      filters.query = "ALICE";
      expect(matchesFilters(order, filters)).toBe(true);

      filters.query = "Bob";
      expect(matchesFilters(order, filters)).toBe(false);
    });

    it("searches by restaurant name (case-insensitive)", () => {
      const order = createMockOrder({ restaurantName: "Sushi Bar" });
      const filters: Filters = {
        query: "sushi",
        statuses: [],
        restaurantName: null,
      };

      expect(matchesFilters(order, filters)).toBe(true);
    });

    it("searches by item name (case-insensitive)", () => {
      const order = createMockOrder({
        items: [
          { name: "Margherita Pizza", quantity: 1, unitPrice: 1200 },
          { name: "Caesar Salad", quantity: 1, unitPrice: 800 },
        ],
      });
      const filters: Filters = {
        query: "pizza",
        statuses: [],
        restaurantName: null,
      };

      expect(matchesFilters(order, filters)).toBe(true);

      filters.query = "salad";
      expect(matchesFilters(order, filters)).toBe(true);

      filters.query = "burger";
      expect(matchesFilters(order, filters)).toBe(false);
    });

    it("applies multiple filters with AND logic", () => {
      const order = createMockOrder({
        customerName: "Alice",
        restaurantName: "Pizza Place",
        status: { kind: "delivered", placedAt: "2024-01-01T12:00:00Z", startedAt: "2024-01-01T12:05:00Z", readyAt: "2024-01-01T12:15:00Z", deliveredAt: "2024-01-01T12:30:00Z" },
      });

      const filters: Filters = {
        query: "alice",
        statuses: ["delivered"],
        restaurantName: "Pizza Place",
      };

      expect(matchesFilters(order, filters)).toBe(true);

      // Change one filter
      filters.restaurantName = "Burger Joint";
      expect(matchesFilters(order, filters)).toBe(false);
    });
  });

  describe("filterAndSortOrders", () => {
    it("filters and sorts orders by total (descending)", () => {
      const orders: Order[] = [
        createMockOrder({ id: "1", total: 1000, customerName: "Alice" }),
        createMockOrder({ id: "2", total: 3000, customerName: "Bob" }),
        createMockOrder({ id: "3", total: 2000, customerName: "Charlie" }),
      ];

      const filters: Filters = { query: "", statuses: [], restaurantName: null };
      const result = filterAndSortOrders(orders, filters);

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe("2"); // 3000 total
      expect(result[1]?.id).toBe("3"); // 2000 total
      expect(result[2]?.id).toBe("1"); // 1000 total
    });

    it("filters out non-matching orders", () => {
      const orders: Order[] = [
        createMockOrder({ id: "1", customerName: "Alice" }),
        createMockOrder({ id: "2", customerName: "Bob" }),
        createMockOrder({ id: "3", customerName: "Charlie" }),
      ];

      const filters: Filters = { query: "alice", statuses: [], restaurantName: null };
      const result = filterAndSortOrders(orders, filters);

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("1");
    });

    it("returns empty array when no orders match", () => {
      const orders: Order[] = [
        createMockOrder({ id: "1", customerName: "Alice" }),
      ];

      const filters: Filters = { query: "xyz", statuses: [], restaurantName: null };
      const result = filterAndSortOrders(orders, filters);

      expect(result).toHaveLength(0);
    });
  });
});
