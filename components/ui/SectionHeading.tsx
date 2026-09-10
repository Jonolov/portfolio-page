type SectionHeadingProps = {
  id: string;
  /** Two-digit section number, e.g. "01". */
  index: string;
  /** Short section name next to the number, e.g. "About". */
  kicker: string;
  /** The full heading line. */
  title: string;
  /** Accent colour class for the number label. */
  accentClassName?: string;
};

export function SectionHeading({
  id,
  index,
  kicker,
  title,
  accentClassName = "text-cyan",
}: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <p
        className={`mb-4 inline-block -rotate-2 font-display text-sm font-semibold tracking-wide ${accentClassName}`}
      >
        {index} — {kicker}
      </p>
      <h2
        id={id}
        className="font-display text-[clamp(2.4rem,6vw,4rem)] font-bold uppercase leading-[0.95] tracking-tight"
      >
        {title}
      </h2>
    </div>
  );
}
