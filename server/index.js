// Mock backend for LiveBoard. Plain JS by design — disposable.
// Do not modify when working on the challenge.

import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

const PORT = 4000;

const RESTAURANTS = [
  "Tony's Pizza",
  "Sakura Sushi",
  "Burger Republic",
  "Taco Verde",
  "Pho Saigon",
  "Curry House",
  "Wok Express",
  "Green Bowl",
  "BBQ Pit",
  "Pasta Mia",
  "Falafel Stop",
  "Bagel & Co",
];

const MENU = [
  { name: "Margherita Pizza", unitPrice: 1450 },
  { name: "Pepperoni Pizza", unitPrice: 1650 },
  { name: "California Roll", unitPrice: 1295 },
  { name: "Salmon Nigiri (6pc)", unitPrice: 1495 },
  { name: "Classic Burger", unitPrice: 1199 },
  { name: "Cheeseburger", unitPrice: 1299 },
  { name: "Chicken Tacos (3)", unitPrice: 1099 },
  { name: "Beef Burrito", unitPrice: 1299 },
  { name: "Pho Bo", unitPrice: 1399 },
  { name: "Spring Rolls", unitPrice: 695 },
  { name: "Chicken Tikka Masala", unitPrice: 1599 },
  { name: "Garlic Naan", unitPrice: 395 },
  { name: "Pad Thai", unitPrice: 1399 },
  { name: "Kung Pao Chicken", unitPrice: 1499 },
  { name: "Buddha Bowl", unitPrice: 1399 },
  { name: "Caesar Salad", unitPrice: 1099 },
  { name: "Pulled Pork Sandwich", unitPrice: 1399 },
  { name: "Brisket Plate", unitPrice: 1899 },
  { name: "Carbonara", unitPrice: 1599 },
  { name: "Lasagna", unitPrice: 1699 },
  { name: "Falafel Wrap", unitPrice: 999 },
  { name: "Hummus Plate", unitPrice: 895 },
  { name: "Everything Bagel + Lox", unitPrice: 1295 },
  { name: "Iced Coffee", unitPrice: 495 },
];

const FIRST_NAMES = [
  "Alex", "Sam", "Maria", "Liam", "Sofia", "Noah", "Emma", "Lucas",
  "Isabella", "Ethan", "Mia", "Mason", "Olivia", "Logan", "Ava",
  "James", "Amelia", "Benjamin", "Harper", "Elijah",
];
const LAST_NAMES = [
  "Garcia", "Smith", "Lopez", "Johnson", "Martinez", "Brown", "Davis",
  "Rodriguez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson",
];

function pick(arr) {
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function randomCustomerName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function randomItems() {
  const n = 1 + Math.floor(Math.random() * 3);
  const items = [];
  for (let i = 0; i < n; i++) {
    const menuItem = pick(MENU);
    items.push({
      name: menuItem.name,
      quantity: 1 + Math.floor(Math.random() * 3),
      unitPrice: menuItem.unitPrice,
    });
  }
  return items;
}

function totalFromItems(items) {
  return items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
}

function randomStatus(placedAtMs) {
  const r = Math.random();
  const placedAt = new Date(placedAtMs).toISOString();

  if (r < 0.3) {
    return { kind: "pending", placedAt };
  }
  if (r < 0.55) {
    const startedAt = new Date(placedAtMs + 60_000 + Math.random() * 120_000).toISOString();
    return { kind: "preparing", placedAt, startedAt };
  }
  if (r < 0.75) {
    const startedAt = new Date(placedAtMs + 60_000).toISOString();
    const readyAt = new Date(placedAtMs + 8 * 60_000).toISOString();
    return { kind: "ready", placedAt, startedAt, readyAt };
  }
  if (r < 0.95) {
    const startedAt = new Date(placedAtMs + 60_000).toISOString();
    const readyAt = new Date(placedAtMs + 8 * 60_000).toISOString();
    const deliveredAt = new Date(placedAtMs + 25 * 60_000).toISOString();
    return { kind: "delivered", placedAt, startedAt, readyAt, deliveredAt };
  }
  const cancelledAt = new Date(placedAtMs + 90_000 + Math.random() * 60_000).toISOString();
  const reason = pick(["Out of stock", "Customer cancelled", "Address issue", "Restaurant closed"]);
  return { kind: "cancelled", placedAt, cancelledAt, reason };
}

function makeOrder({ ageMs = 0 } = {}) {
  const placedAtMs = Date.now() - ageMs;
  const items = randomItems();
  return {
    id: `ord_${randomUUID()}`,
    customerName: randomCustomerName(),
    restaurantName: pick(RESTAURANTS),
    items,
    total: totalFromItems(items),
    status: randomStatus(placedAtMs),
  };
}

function seedOrders(count) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    // Spread placedAt across the last ~30 minutes so the per-minute chart has content
    const ageMs = Math.floor(Math.random() * 30 * 60_000);
    orders.push(makeOrder({ ageMs }));
  }
  return orders;
}

const SEED = seedOrders(50);

const app = express();
app.use(cors());

app.get("/api/orders", (_req, res) => {
  res.json(SEED);
});

app.get("/api/orders/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  // initial comment to open the stream
  res.write(": connected\n\n");

  const interval = setInterval(() => {
    const order = makeOrder({ ageMs: 0 });
    res.write(`event: order\n`);
    res.write(`data: ${JSON.stringify(order)}\n\n`);
  }, 500);

  req.on("close", () => {
    clearInterval(interval);
  });
});

const server = app.listen(PORT, () => {
  console.log(`[api] LiveBoard mock server on http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`\n[api] ${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 2000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
