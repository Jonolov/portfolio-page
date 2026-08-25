"use client";

import { Command } from "cmdk";
import { useState } from "react";
import { profile } from "@/content/profile";
import { skills } from "@/content/skills";
import { useCommandPalette } from "./useCommandPalette";

const navItems = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const stackSummary = skills
  .map((group) => `${group.category}: ${group.skills.join(", ")}`)
  .join("\n");

type Page = "whoami" | "stack" | "contact";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState("");
  const page = pages[pages.length - 1];

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPages([]);
      setSearch("");
    }
  }

  function goToSection(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={handleOpenChange}
      label="Command palette"
      shouldFilter={!page}
      overlayClassName="fixed inset-0 z-50 bg-foreground/20 opacity-0 backdrop-blur-sm data-[state=open]:opacity-100 motion-safe:transition-opacity motion-safe:duration-150"
      contentClassName="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 scale-95 overflow-hidden rounded-2xl border border-foreground/10 bg-background text-foreground opacity-0 shadow-2xl data-[state=open]:scale-100 data-[state=open]:opacity-100 motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-out"
      onKeyDown={(event) => {
        if (event.key === "Backspace" && !search && pages.length > 0) {
          event.preventDefault();
          setPages((prev) => prev.slice(0, -1));
        }
      }}
    >
      <Command.Input
        autoFocus
        value={search}
        onValueChange={setSearch}
        placeholder={
          page ? "Press backspace to go back" : "Jump to a section, or ask whoami / stack…"
        }
        className="w-full border-b border-foreground/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-foreground/60"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-2 py-6 text-center text-sm text-foreground/70">
          No results found.
        </Command.Empty>

        {!page && (
          <>
            <Command.Group
              heading="Navigate"
              className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-foreground/60 [&_[cmdk-group-items]]:mt-1"
            >
              {navItems.map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => goToSection(item.id)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground/90 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group
              heading="Ask"
              className="mt-2 px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-foreground/60 [&_[cmdk-group-items]]:mt-1"
            >
              <Command.Item
                onSelect={() => setPages((prev) => [...prev, "whoami"])}
                className="cursor-pointer rounded-lg px-3 py-2 font-mono text-sm text-foreground/90 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
              >
                whoami
              </Command.Item>
              <Command.Item
                onSelect={() => setPages((prev) => [...prev, "stack"])}
                className="cursor-pointer rounded-lg px-3 py-2 font-mono text-sm text-foreground/90 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
              >
                stack
              </Command.Item>
              <Command.Item
                onSelect={() => setPages((prev) => [...prev, "contact"])}
                className="cursor-pointer rounded-lg px-3 py-2 font-mono text-sm text-foreground/90 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
              >
                contact
              </Command.Item>
            </Command.Group>
          </>
        )}

        {page === "whoami" && (
          <div className="px-1 py-1">
            <p className="whitespace-pre-wrap px-3 py-3 text-sm text-foreground/80">
              {profile.name} — {profile.roleLine}
              {"\n\n"}
              {profile.heroHook}
            </p>
            <Command.Item
              onSelect={() => setPages((prev) => prev.slice(0, -1))}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground/60 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              ← Back
            </Command.Item>
          </div>
        )}

        {page === "stack" && (
          <div className="px-1 py-1">
            <p className="whitespace-pre-wrap px-3 py-3 font-mono text-sm text-foreground/80">
              {stackSummary}
            </p>
            <Command.Item
              onSelect={() => setPages((prev) => prev.slice(0, -1))}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground/60 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              ← Back
            </Command.Item>
          </div>
        )}

        {page === "contact" && (
          <div className="px-1 py-1">
            <div className="px-3 py-3 text-sm text-foreground/80">
              {profile.contact.availableForConsulting ? (
                <p className="mb-2 inline-flex items-center gap-2 font-medium">
                  <span
                    className="h-2 w-2 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  {profile.contact.statusLine}
                </p>
              ) : null}
              <a
                href={`mailto:${profile.contact.email}`}
                className="block font-mono text-accent underline underline-offset-4"
              >
                {profile.contact.email}
              </a>
              <a
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block underline underline-offset-4"
              >
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <Command.Item
              onSelect={() => setPages((prev) => prev.slice(0, -1))}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground/60 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              ← Back
            </Command.Item>
          </div>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
