// The brand "J" as a block glyph: the letter, then the green underline
// bar. "#" = letter cell, "=" = accent (green) cell. Rendered by
// <BlockMark> in the nav and the contact sign-off, and by <FlipMark>
// as it flies between the two.
const GRID = [
  ".####",
  "...#.",
  "...#.",
  "...#.",
  "#..#.",
  "#..#.",
  ".##..",
  ".....", // breathing room between the letter and the bar, like the SVG
  "=====",
];

export interface MarkCell {
  row: number;
  col: number;
  accent: boolean;
}

export function blockMarkCells(): MarkCell[] {
  const cells: MarkCell[] = [];
  GRID.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === "#") cells.push({ row, col, accent: false });
      else if (ch === "=") cells.push({ row, col, accent: true });
    });
  });
  return cells;
}

export const BLOCK_MARK_COLS = GRID[0].length;
export const BLOCK_MARK_ROWS = GRID.length;

// Shared so the static mark and the flown FlipMark land at the same size.
export const MARK_CELL = "clamp(1.1rem, 4.2vw, 1.9rem)";
export const MARK_GAP = "0.2rem";

// The small nav brand. Near-zero gap so the strokes read as solid at this
// size instead of turning into a dotted texture.
export const NAV_MARK_CELL = "4px";
export const NAV_MARK_GAP = "0.5px";
