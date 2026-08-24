interface SectionHeadingProps {
  id: string;
  eyebrow?: string;
  title: string;
}

export function SectionHeading({ id, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wide text-foreground/60">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="text-3xl font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}
