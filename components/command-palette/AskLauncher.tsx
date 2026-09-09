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
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border border-foreground/15 bg-background/80 px-4 py-2.5 font-mono text-xs text-foreground/80 shadow-lg backdrop-blur hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-safe:transition-colors sm:bottom-6 sm:right-6"
    >
      <span className="text-accent">$</span> ask jon-bot
    </button>
  );
}
