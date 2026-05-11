import type { Order } from "./types";

const API_BASE = "http://localhost:4000";

export async function fetchInitialOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`);
  if (!res.ok) {
    throw new Error(`Failed to load orders: ${res.status}`);
  }
  return (await res.json()) as Order[];
}
