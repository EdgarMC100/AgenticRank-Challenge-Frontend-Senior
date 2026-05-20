import type { Order } from "./types";
import { API_BASE_URL } from "./config";

export async function fetchInitialOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/api/orders`);
  if (!res.ok) {
    throw new Error(`Failed to load orders: ${res.status}`);
  }
  return (await res.json()) as Order[];
}
