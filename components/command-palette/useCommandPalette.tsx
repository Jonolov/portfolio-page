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
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const openRef = useRef(open);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const setOpen = useCallback((next: boolean) => {
    if (next && !openRef.current) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
    }
    if (!next && openRef.current) {
      const target = previouslyFocused.current;
      // Radix's own focus-restore only knows about a registered trigger
      // element; our triggers include a global keydown listener with no
      // such element, so it falls back to document.body. Run after Radix's
      // own unmount-driven cleanup so this is the final word.
      requestAnimationFrame(() => target?.focus?.());
    }
    setOpenState(next);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!openRef.current);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
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
