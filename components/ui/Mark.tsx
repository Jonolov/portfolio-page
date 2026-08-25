// Fixed brand mark — intentionally not theme-adaptive, matching the
// favicon/apple-icon exactly so it reads as one consistent logo wherever
// it shows up (tab, home screen, page header).
const INK = "#121815";
const PAPER = "#eafbf1";
const GREEN = "#3ddc84";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" fill={INK} />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontWeight="800"
        fontSize="20"
        fill={PAPER}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        J
      </text>
      <rect x="7" y="26" width="18" height="3.5" fill={GREEN} />
    </svg>
  );
}
