import { useEffect } from "react";
import type { ConnectionState, Order } from "../types";

interface UseOrderStreamResult {
  status: ConnectionState;
}

export function useOrderStream(
  onOrder: (order: Order) => void,
): UseOrderStreamResult {
  useEffect(() => {
    const es = new EventSource("http://localhost:4000/api/orders/stream");
    es.addEventListener("order", (e) => {
      const order = JSON.parse((e as MessageEvent).data) as Order;
      onOrder(order);
    });
    return () => es.close();
  }, [onOrder]);

  return { status: "connected" };
}
