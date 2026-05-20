import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { FilterBar } from "../components/FilterBar";

describe("FilterBar", () => {
  it("renders the search input", () => {
    render(<FilterBar restaurants={[]} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("notifies parent when the query changes", async () => {
    const user = userEvent.setup();
    const queries: string[] = [];
    render(
      <FilterBar
        restaurants={[]}
        onChange={(f) => {
          queries.push(f.query);
        }}
      />,
    );
    await user.type(screen.getByPlaceholderText(/search/i), "pizza");

    // Wait for debounced value to propagate (300ms debounce)
    await waitFor(() => {
      expect(queries.at(-1)).toBe("pizza");
    }, { timeout: 500 });
  });

  it("persists query across remounts via localStorage", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <FilterBar restaurants={[]} onChange={() => {}} />,
    );

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "pizza");

    // Verify the input shows "pizza"
    expect(input).toHaveValue("pizza");

    // Wait for the value to be saved to localStorage
    await waitFor(() => {
      const stored = localStorage.getItem("liveboard-filters");
      expect(stored).toBeTruthy();
      expect(stored).toContain("pizza");
    }, { timeout: 500 });

    unmount();

    // Remount and check if the value persists
    render(<FilterBar restaurants={[]} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("pizza");
  });
});
