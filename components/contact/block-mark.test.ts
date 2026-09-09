import { describe, expect, it } from "vitest";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/contact/block-mark";

describe("blockMarkCells", () => {
  it("returns cells within the declared grid bounds", () => {
    const cells = blockMarkCells();
    expect(cells.length).toBeGreaterThan(10);
    expect(cells.length).toBeLessThanOrEqual(28);
    for (const c of cells) {
      expect(c.row).toBeGreaterThanOrEqual(0);
      expect(c.row).toBeLessThan(BLOCK_MARK_ROWS);
      expect(c.col).toBeGreaterThanOrEqual(0);
      expect(c.col).toBeLessThan(BLOCK_MARK_COLS);
    }
  });

  it("has an accent (green bar) row and non-accent letter cells", () => {
    const cells = blockMarkCells();
    expect(cells.some((c) => c.accent)).toBe(true);
    expect(cells.some((c) => !c.accent)).toBe(true);
    const accentRows = new Set(cells.filter((c) => c.accent).map((c) => c.row));
    expect(accentRows.size).toBe(1);
    expect([...accentRows][0]).toBe(BLOCK_MARK_ROWS - 1);
  });
});
