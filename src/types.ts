export type OrderStatus =
  | { kind: "pending"; placedAt: string }
  | { kind: "preparing"; placedAt: string; startedAt: string }
  | { kind: "ready"; placedAt: string; startedAt: string; readyAt: string }
  | {
      kind: "delivered";
      placedAt: string;
      startedAt: string;
      readyAt: string;
      deliveredAt: string;
    }
  | { kind: "cancelled"; placedAt: string; cancelledAt: string; reason: string };

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export type StatusKind = OrderStatus["kind"];

export interface Filters {
  query: string;
  statuses: StatusKind[];
  restaurantName: string | null;
}

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";
