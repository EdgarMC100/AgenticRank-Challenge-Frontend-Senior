import { useEffect, useState } from "react";
import type { Filters, StatusKind } from "../types";
import "./FilterBar.css";

interface Props {
  restaurants: string[];
  onChange: (filters: Filters) => void;
}

const STATUS_OPTIONS: StatusKind[] = [
  "pending",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

export function FilterBar({ restaurants, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<StatusKind[]>([]);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    onChange({ query, statuses, restaurantName });
  }, [query, statuses, restaurantName, onChange]);

  function toggleStatus(kind: StatusKind) {
    setStatuses((prev) =>
      prev.includes(kind) ? prev.filter((s) => s !== kind) : [...prev, kind],
    );
  }

  return (
    <section className="filter-bar" aria-label="Filters">
      <div className="filter-bar__row">
        <label className="filter-bar__field" htmlFor="filter-query">
          <span className="filter-bar__label">Search</span>
          <input
            id="filter-query"
            type="text"
            placeholder="Search customer, restaurant, or item…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <label className="filter-bar__field" htmlFor="filter-restaurant">
          <span className="filter-bar__label">Restaurant</span>
          <select
            id="filter-restaurant"
            value={restaurantName ?? ""}
            onChange={(e) =>
              setRestaurantName(e.target.value === "" ? null : e.target.value)
            }
          >
            <option value="">All restaurants</option>
            {restaurants.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="filter-bar__statuses">
        <legend className="filter-bar__label">Status</legend>
        {STATUS_OPTIONS.map((kind) => {
          const id = `filter-status-${kind}`;
          const checked = statuses.includes(kind);
          return (
            <label key={kind} className="filter-bar__chip" htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => toggleStatus(kind)}
              />
              <span>{kind}</span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}
