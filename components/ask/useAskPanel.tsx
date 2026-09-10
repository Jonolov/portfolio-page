"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface AskPanelContextValue {
  askOpen: boolean;
  openAsk: () => void;
  closeAsk: () => void;
}

const AskPanelContext = createContext<AskPanelContextValue | null>(null);

export function AskPanelProvider({ children }: { children: ReactNode }) {
  const [askOpen, setAskOpen] = useState(false);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const openAsk = useCallback(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setAskOpen(true);
  }, []);

  const closeAsk = useCallback(() => {
    setAskOpen(false);
    // Escape closes the native <dialog> without routing through here, so the
    // panel also calls this on its own `close` event. Restore focus to
    // whatever opened it (the launcher), after the dialog has torn down.
    const target = previouslyFocused.current;
    requestAnimationFrame(() => target?.focus?.());
  }, []);

  return (
    <AskPanelContext.Provider value={{ askOpen, openAsk, closeAsk }}>
      {children}
    </AskPanelContext.Provider>
  );
}

export function useAskPanel() {
  const context = useContext(AskPanelContext);
  if (!context) {
    throw new Error("useAskPanel must be used within an AskPanelProvider");
  }
  return context;
}
