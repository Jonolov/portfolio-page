"use client";

import { useCommandPalette } from "./useCommandPalette";

export function AskLauncher() {
  const { openAsk, askOpen, open: paletteOpen } = useCommandPalette();

  return (
    <button
      type="button"
      hidden={askOpen || paletteOpen}
      onClick={() => openAsk()}
      aria-label="Ask jon-bot about Jon's work"
      className="group fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-ink text-ink-fg shadow-lg hover:bg-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground motion-safe:transition-colors sm:bottom-6 sm:right-6"
    >
      {/* Filled speech bubble with a typing ellipsis — reads as "chat". */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="currentColor"
      >
        <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9.4l-4.6 3.6A1 1 0 0 1 3 20V5a2 2 0 0 1 2-2Z" />
        <circle cx="8.5" cy="10.5" r="1.35" fill="var(--ink)" />
        <circle cx="12" cy="10.5" r="1.35" fill="var(--ink)" />
        <circle cx="15.5" cy="10.5" r="1.35" fill="var(--ink)" />
      </svg>
    </button>
  );
}
