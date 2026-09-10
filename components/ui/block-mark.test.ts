import { describe, expect, it } from "vitest";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/ui/block-mark";

describe("blockMarkCells", () => {
  it("returns cells within the declared grid bounds", () => {
    const cells = blockMarkCells();
    expect(cells.length).toBeGreaterThan(10);
    expect(cells.length).toBeLessThanOrEqual(BLOCK_MARK_COLS * BLOCK_MARK_ROWS);
    for (const c of cells) {
      expect(c.row).toBeGreaterThanOrEqual(0);
      expect(c.row).toBeLessThan(BLOCK_MARK_ROWS);
      expect(c.col).toBeGreaterThanOrEqual(0);
      expect(c.col).toBeLessThan(BLOCK_MARK_COLS);
    }
  });

  it("has an accent bar spanning the full width on the last row", () => {
    const cells = blockMarkCells();
    expect(cells.some((c) => !c.accent)).toBe(true);
    const accent = cells.filter((c) => c.accent);
    const accentRows = new Set(accent.map((c) => c.row));
    expect(accentRows.size).toBe(1);
    expect([...accentRows][0]).toBe(BLOCK_MARK_ROWS - 1);
    // the bar runs under both letters
    expect(new Set(accent.map((c) => c.col)).size).toBe(BLOCK_MARK_COLS);
  });
});
