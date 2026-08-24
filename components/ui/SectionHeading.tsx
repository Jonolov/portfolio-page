interface SectionHeadingProps {
  id: string;
  eyebrow?: string;
  title: string;
}

export function SectionHeading({ id, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight"
      >
        {title}
      </h2>
    </div>
  );
}
