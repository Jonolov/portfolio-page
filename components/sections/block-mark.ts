// A block-glyph "J" that echoes the brand <Mark>: the letter in blocks with
// the green underline bar. "#" = ink cell, "=" = accent (green) cell.
const GRID = [
  ".####",
  "...#.",
  "...#.",
  "...#.",
  "#..#.",
  "#..#.",
  ".##..",
  "=====",
];

export interface Cell {
  row: number;
  col: number;
  accent: boolean;
}

export function blockMarkCells(): Cell[] {
  const cells: Cell[] = [];
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
