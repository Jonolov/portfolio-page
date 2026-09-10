import type { Profile } from "@/lib/types";

export function ContactCard({ contact }: { contact: Profile["contact"] }) {
  return (
    <div className="text-sm text-paper-fg/80">
      {contact.availableForConsulting ? (
        <p className="mb-2 inline-flex items-center gap-2 font-medium">
          <span
            className="h-2 w-2 rounded-full bg-cyan"
            aria-hidden="true"
          />
          {contact.statusLine}
        </p>
      ) : null}
      <a
        href={`mailto:${contact.email}`}
        className="block font-display text-cyan underline underline-offset-4"
      >
        {contact.email}
      </a>
      <a
        href={contact.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block underline underline-offset-4"
      >
        LinkedIn<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
