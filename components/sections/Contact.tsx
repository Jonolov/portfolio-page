import type { Profile } from "@/lib/types";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  MARK_CELL,
  MARK_GAP,
  blockMarkCells,
} from "@/components/contact/block-mark";
import { CONTACT_GROUND } from "@/components/contact/ground";

const banded = CONTACT_GROUND === "banded";

export function Contact({ contact }: { contact: Profile["contact"] }) {
  const cells = blockMarkCells();

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-contact
      className={
        banded
          ? "flex min-h-screen w-full flex-col justify-center bg-band-background py-24 text-band-foreground"
          : "flex min-h-screen w-full flex-col justify-center py-24"
      }
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2
          id="contact-heading"
          className={`font-mono text-xs uppercase tracking-wide ${
            banded ? "text-band-foreground/60" : "text-foreground/60"
          }`}
        >
          <span className={banded ? "text-band-accent" : "text-accent"}>
            {"// "}
          </span>
          contact — get in touch
        </h2>

        {/* Static J — the accessible / no-JS / reduced-motion image.
            FlipMark overlays this exactly when it animates. */}
        <div
          data-contact-mark
          aria-hidden="true"
          className="my-16 grid"
          style={{
            gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, ${MARK_CELL})`,
            gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, ${MARK_CELL})`,
            gap: MARK_GAP,
          }}
        >
          {cells.map((cell, i) => (
            <span
              key={i}
              style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
              className={
                cell.accent
                  ? banded
                    ? "bg-band-accent"
                    : "bg-accent"
                  : banded
                    ? "bg-band-foreground"
                    : "bg-foreground"
              }
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 font-mono text-sm">
          {contact.availableForConsulting ? (
            <p
              data-contact-reveal
              className={
                banded ? "text-band-foreground/70" : "text-foreground/70"
              }
            >
              status:{" "}
              <span className={banded ? "text-band-accent" : "text-accent"}>
                {contact.statusLine}
              </span>
            </p>
          ) : null}

          <p data-contact-reveal>
            <a
              href={`mailto:${contact.email}`}
              className={`rounded text-lg font-bold break-words underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-xl ${
                banded
                  ? "text-band-accent focus-visible:outline-band-foreground"
                  : "text-accent focus-visible:outline-foreground"
              }`}
            >
              {contact.email}
            </a>
          </p>

          <p
            data-contact-reveal
            className={
              banded ? "text-band-foreground/70" : "text-foreground/70"
            }
          >
            {contact.company.toLowerCase()} · {contact.location.toLowerCase()}
          </p>

          <p data-contact-reveal>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                banded
                  ? "text-band-foreground/70 hover:text-band-accent focus-visible:outline-band-foreground"
                  : "text-foreground/70 hover:text-accent focus-visible:outline-foreground"
              }`}
            >
              linkedin<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
