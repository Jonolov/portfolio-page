type MarkProps = {
  /** Tailwind classes for the box — background + text colour. */
  className?: string;
  size?: "nav" | "lg";
  /**
   * Hide from assistive tech (no `role`/`aria-label`). Use when an adjacent
   * element already carries the accessible name, e.g. the nav home link.
   */
  decorative?: boolean;
};

/**
 * The "JS" brand lockup — Jon Stjärnström / JavaScript. Plain text in a
 * rounded box (replaces the old block-glyph mark). Decorative for
 * sighted users; carries the name for assistive tech.
 */
export function Mark({
  className = "",
  size = "nav",
  decorative = false,
}: MarkProps) {
  const scale =
    size === "nav"
      ? "rounded-md px-1.5 py-0.5 text-[17px] sm:text-xl"
      : "rounded-lg px-2.5 py-1 text-2xl";
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": "Jon Stjärnström" } as const);
  return (
    <span
      {...a11y}
      className={`inline-flex items-center font-display font-bold leading-none tracking-[-0.06em] ${scale} ${className}`}
    >
      JS
    </span>
  );
}
