import { useEffect } from "react";
import type { ConnectionState, Order } from "../types";
import { API_BASE_URL } from "../config";

interface UseOrderStreamResult {
  status: ConnectionState;
}

export function useOrderStream(
  onOrder: (order: Order) => void,
): UseOrderStreamResult {
  useEffect(() => {
    const es = new EventSource(`${API_BASE_URL}/api/orders/stream`);
    es.addEventListener("order", (e) => {
      const order = JSON.parse((e as MessageEvent).data) as Order;
      onOrder(order);
    });
    return () => es.close();
  }, [onOrder]);

  return { status: "connected" };
}
