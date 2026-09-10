import type { CSSProperties, HTMLAttributes } from "react";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/ui/block-mark";

// Deterministic pseudo-random in [0, 1) — seeded by cell index so the
// server and client render the exact same scatter (no hydration drift).
function noise(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

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
      {blockMarkCells().map((c, i) => {
        const style: CSSProperties = {
          gridRow: c.row + 1,
          gridColumn: c.col + 1,
        };
        if (animated) {
          // Each block flies in from a random offset, in a random order —
          // a miniature of the FlipMark shatter.
          const vars = {
            "--bx": `${((noise(i + 1) - 0.5) * 22).toFixed(1)}px`,
            "--by": `${((noise(i + 7) - 0.5) * 22).toFixed(1)}px`,
            "--br": `${((noise(i + 13) - 0.5) * 100).toFixed(0)}deg`,
          } as CSSProperties;
          Object.assign(style, vars);
          style.animationDelay = `${(noise(i + 19) * 0.26).toFixed(3)}s`;
        }
        return (
          <span
            key={i}
            style={style}
            className={`${c.accent ? accentClassName : cellClassName} ${
              animated ? "motion-safe:animate-block-in" : ""
            }`}
          />
        );
      })}
    </span>
  );
}
