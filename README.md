# LiveBoard

Real-time order management dashboard for food delivery operations.

## Stack

- React 18 + TypeScript (strict mode)
- Vite
- Recharts for analytics
- Vitest + Testing Library for tests
- Express mock backend with Server-Sent Events

## Getting started

```bash
pnpm install
pnpm dev
```

This boots the Vite dev server on http://localhost:5173 and the mock backend on http://localhost:4000.

## Architecture

- `src/components/` — UI components, all memoized via `React.memo`.
- `src/hooks/useOrderStream.ts` — SSE client with automatic reconnection and exponential backoff.
- `src/components/FilterBar.tsx` — filters are persisted to `localStorage` and restored on mount.
- `server/` — mock backend. Do not modify; treat it as if it were a deployed service.

## Tests

```bash
pnpm test
```

## Known issues

- Performance is occasionally bumpy when many orders are on screen at once. We've added memoization everywhere it matters, but you may want to profile if it gets worse.
- Ops has reported that filters sometimes "feel like they reset" after a long session. We haven't been able to reproduce it.
