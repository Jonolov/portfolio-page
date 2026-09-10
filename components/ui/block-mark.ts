// The brand "JS" as a block glyph — Jon Stjärnström, and JavaScript.
// The two letters, a blank row, then the green underline bar spanning
// both. "#" = letter cell, "=" = accent (green) cell. Rendered by
// <BlockMark> in the nav and the contact sign-off, and by <FlipMark>
// as it flies between the two.
const GRID = [
  ".####..###",
  "...#..#...",
  "...#..#...",
  "...#...##.",
  "#..#.....#",
  "#..#.....#",
  ".##...###.",
  "..........", // breathing room between the letters and the bar
  "==========",
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
// 10 columns wide now, so the cell is smaller than the old 5-wide "J".
export const MARK_CELL = "clamp(0.9rem, 3vw, 1.6rem)";
export const MARK_GAP = "0.2rem";

// The small nav brand. Near-zero gap so the strokes read as solid at this
// size instead of turning into a dotted texture.
export const NAV_MARK_CELL = "3.5px";
export const NAV_MARK_GAP = "0.5px";
