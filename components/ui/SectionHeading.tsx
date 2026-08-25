interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
}

export function SectionHeading({ id, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mb-10 border-t border-foreground/10 pt-4">
      <h2
        id={id}
        className="font-mono text-xs uppercase tracking-wide text-foreground/60"
      >
        <span className="text-accent">{"// "}</span>
        {eyebrow} — {title}
      </h2>
    </div>
  );
}
