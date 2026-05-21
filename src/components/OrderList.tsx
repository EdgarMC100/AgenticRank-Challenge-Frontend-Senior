import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Filters, Order } from "../types";
import { OrderRow } from "./OrderRow";
import { filterAndSortOrders } from "../utils/orderFilters";
import "./OrderList.css";

interface Props {
  orders: Order[];
  filters: Filters;
}

// Create formatter once at module level
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function OrderList({ orders, filters }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterAndSortOrders(orders, filters),
    [orders, filters]
  );

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, o) => sum + o.total, 0),
    [filtered]
  );

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Approximate OrderRow height
    overscan: 5, // Render 5 extra items above/below viewport for smooth scrolling
  });

  return (
    <section className="order-list">
      <header className="order-list__header">
        <h2 className="order-list__title">Orders</h2>
        <div className="order-list__stats">
          <span>
            <strong>{filtered.length}</strong> shown
          </span>
          <span>
            <strong>{CURRENCY_FORMATTER.format(totalRevenue / 100)}</strong> revenue
          </span>
        </div>
      </header>
      <div
        ref={parentRef}
        className="order-list__items"
        style={{ maxHeight: "60vh", overflow: "auto" }}
      >
        <ul
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const order = filtered[virtualRow.index];
            if (!order) return null;
            return (
              <div
                key={order.id}
                data-index={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <OrderRow order={order} />
              </div>
            );
          })}
        </ul>
      </div>
      {filtered.length === 0 ? (
        <p className="order-list__empty">No orders match the current filters.</p>
      ) : null}
    </section>
  );
}
