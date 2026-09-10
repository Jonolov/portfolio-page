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
      className="group fixed bottom-4 right-4 z-30 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:bottom-6 sm:right-6"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-ink-fg opacity-0 shadow-lg motion-safe:transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        ask jon-bot
      </span>
      {/* Pre-sized 18 KB webp, fixed 56–64px, well below the fold — next/image
          would only add srcset machinery for no gain. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/jon-avatar.webp"
        alt=""
        width={64}
        height={64}
        className="h-14 w-14 rounded-full object-cover object-top shadow-lg ring-4 ring-background motion-safe:transition-transform group-hover:scale-105 sm:h-16 sm:w-16"
      />
    </button>
  );
}
