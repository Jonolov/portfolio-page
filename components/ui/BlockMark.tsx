import type { HTMLAttributes } from "react";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/ui/block-mark";

type BlockMarkProps = {
  /** CSS length for one grid cell — may be a `var(--…)` reference. */
  cell: string;
  /** CSS length for the gap between cells. */
  gap: string;
  /** Class for the letter cells. */
  cellClassName: string;
  /** Class for the accent (green underline) cells. */
  accentClassName: string;
  /**
   * Stagger the blocks in on mount (motion-safe only; static otherwise).
   * For the nav brand — the contact sign-off is animated by <FlipMark>.
   */
  animated?: boolean;
} & HTMLAttributes<HTMLSpanElement>;

/**
 * The brand "J" drawn as a grid of blocks. Static — <FlipMark> renders its
 * own animatable copy. Decorative: `aria-hidden`, so give it an accessible
 * label on a wrapping element.
 */
export function BlockMark({
  cell,
  gap,
  cellClassName,
  accentClassName,
  animated = false,
  className,
  ...rest
}: BlockMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid ${className ?? ""}`}
      style={{
        gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, ${cell})`,
        gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, ${cell})`,
        gap,
      }}
      {...rest}
    >
      {blockMarkCells().map((c, i) => (
        <span
          key={i}
          style={{
            gridRow: c.row + 1,
            gridColumn: c.col + 1,
            // Reading-order stagger: blockMarkCells() is row-major, so the
            // J draws top-to-bottom and the green bar lands last.
            animationDelay: animated ? `${i * 0.022}s` : undefined,
          }}
          className={`${c.accent ? accentClassName : cellClassName} ${
            animated ? "motion-safe:animate-block-in" : ""
          }`}
        />
      ))}
    </span>
  );
}
