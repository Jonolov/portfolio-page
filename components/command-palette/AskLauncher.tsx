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
      className="group fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-xs font-medium text-ink-fg shadow-lg hover:bg-field focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground motion-safe:transition-colors sm:bottom-6 sm:right-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
      ask jon-bot
    </button>
  );
}
