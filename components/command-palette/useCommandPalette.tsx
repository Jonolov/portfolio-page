"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  askOpen: boolean;
  askSeed: string;
  openAsk: (seed?: string) => void;
  closeAsk: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [askOpen, setAskOpenState] = useState(false);
  const [askSeed, setAskSeed] = useState("");
  // Kept in sync *synchronously* by every mutator below, not via an effect —
  // the global keydown handler reads them and can fire before React flushes.
  const openRef = useRef(open);
  const askOpenRef = useRef(askOpen);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const restoreFocus = useCallback(() => {
    const target = previouslyFocused.current;
    // Radix's own focus-restore only knows about a registered trigger
    // element; our triggers include a global keydown listener with no
    // such element, so it falls back to document.body. Run after Radix's
    // own unmount-driven cleanup so this is the final word.
    requestAnimationFrame(() => target?.focus?.());
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next && !openRef.current) {
        previouslyFocused.current = document.activeElement as HTMLElement | null;
      }
      if (!next && openRef.current) {
        restoreFocus();
      }
      openRef.current = next;
      setOpenState(next);
    },
    [restoreFocus],
  );

  const openAsk = useCallback((seed = "") => {
    // The palette's own open already captured previouslyFocused; keep it
    // pointing at the pre-palette element so closeAsk can restore it.
    openRef.current = false;
    askOpenRef.current = true;
    setAskSeed(seed);
    setOpenState(false);
    setAskOpenState(true);
  }, []);

  const closeAsk = useCallback(() => {
    askOpenRef.current = false;
    setAskOpenState(false);
    setAskSeed("");
    restoreFocus();
  }, [restoreFocus]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (askOpenRef.current) {
          closeAsk();
          return;
        }
        setOpen(!openRef.current);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen, closeAsk]);

  return (
    <CommandPaletteContext.Provider
      value={{ open, setOpen, askOpen, askSeed, openAsk, closeAsk }}
    >
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return context;
}
