"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useId, useRef } from "react";
import { ContactCard } from "@/components/ui/ContactCard";
import type { Profile } from "@/lib/types";
import { useCommandPalette } from "./useCommandPalette";

const SUGGESTIONS = [
  "Is Jon available for contract work?",
  "What has Jon built with Next.js?",
  "Does Jon have DevOps experience?",
];

export function AskPanel({ contact }: { contact: Profile["contact"] }) {
  const { askOpen, askSeed, closeAsk } = useCommandPalette();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const seededRef = useRef(false);
  const headingId = useId();

  const { messages, sendMessage, status, error } = useChat();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (askOpen && !el.open) {
      el.showModal();
      inputRef.current?.focus();
    } else if (!askOpen && el.open) {
      el.close();
    }
  }, [askOpen]);

  useEffect(() => {
    if (askOpen && askSeed && !seededRef.current) {
      seededRef.current = true;
      sendMessage({ text: askSeed });
    }
    if (!askOpen) seededRef.current = false;
  }, [askOpen, askSeed, sendMessage]);

  const busy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={closeAsk}
      className="fixed left-1/2 top-24 m-0 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-foreground/10 bg-background p-0 text-foreground shadow-2xl backdrop:bg-foreground/20 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
        <h2 id={headingId} className="font-mono text-xs text-foreground/70">
          ~/ask
        </h2>
        <button
          type="button"
          onClick={closeAsk}
          aria-label="Close"
          className="rounded px-2 text-foreground/60 hover:text-accent"
        >
          ✕
        </button>
      </div>

      <div
        role="log"
        className="max-h-[60vh] space-y-4 overflow-y-auto p-4 text-sm"
      >
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-foreground/60">Ask about Jon&apos;s experience.</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="block w-full rounded-lg border border-foreground/10 px-3 py-2 text-left hover:border-accent/40 hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, mi) => {
            const isLast = mi === messages.length - 1;
            const lastTextIndex = m.parts.reduce(
              (acc, p, idx) => (p.type === "text" ? idx : acc),
              -1,
            );
            return (
              <div key={m.id}>
                <p className="mb-1 font-mono text-xs text-foreground/70">
                  {m.role === "user" ? "you" : "jon-bot"}
                </p>
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <p key={i} className="whitespace-pre-wrap">
                        {part.text}
                        {isLast && m.role === "assistant" && i === lastTextIndex ? (
                          <span
                            className="ml-0.5 inline-block motion-safe:animate-caret"
                            aria-hidden="true"
                          >
                            ▍
                          </span>
                        ) : null}
                      </p>
                    );
                  }
                  if (part.type === "tool-showContactCard") {
                    return (
                      <div key={i} className="mt-2">
                        <ContactCard contact={contact} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })
        )}
        {status === "submitted" ? (
          <div>
            <p className="mb-1 font-mono text-xs text-foreground/70">jon-bot</p>
            <p aria-hidden="true">
              <span className="inline-block motion-safe:animate-caret">▍</span>
            </p>
          </div>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {status === "ready" &&
        messages.length > 0 &&
        messages[messages.length - 1]?.role === "assistant"
          ? messages[messages.length - 1].parts
              .filter((p) => p.type === "text")
              .map((p) => (p as { text: string }).text)
              .join(" ")
          : ""}
      </p>

      {status === "error" ? (
        <p role="alert" className="px-4 pb-2 text-sm text-foreground/70">
          {/rate_limited/.test(error?.message ?? "")
            ? "You're sending messages a bit fast — give it a moment."
            : `Something went wrong — email Jon directly at ${contact.email}.`}
        </p>
      ) : null}

      <form
        className="flex gap-2 border-t border-foreground/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const el = inputRef.current;
          if (!el) return;
          submit(el.value);
          el.value = "";
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          aria-label="Ask a question about Jon"
          placeholder="Ask a question…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="flex-1 resize-none rounded-lg border border-foreground/10 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-foreground/70"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </dialog>
  );
}
