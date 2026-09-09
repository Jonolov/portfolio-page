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
  const [askOpen, setAskOpen] = useState(false);
  const [askSeed, setAskSeed] = useState("");
  const openRef = useRef(open);
  const askOpenRef = useRef(askOpen);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    askOpenRef.current = askOpen;
  }, [askOpen]);

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
      setOpenState(next);
    },
    [restoreFocus],
  );

  const openAsk = useCallback((seed = "") => {
    // The palette's own open already captured previouslyFocused; keep it
    // pointing at the pre-palette element so closeAsk can restore it.
    setAskSeed(seed);
    setOpenState(false);
    setAskOpen(true);
  }, []);

  const closeAsk = useCallback(() => {
    setAskOpen(false);
    setAskSeed("");
    restoreFocus();
  }, [restoreFocus]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (askOpenRef.current) {
          setAskOpen(false);
          setAskSeed("");
          restoreFocus();
          return;
        }
        setOpen(!openRef.current);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen, restoreFocus]);

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
