"use client";

import { useEffect, useState } from "react";
import { BlockMark } from "@/components/ui/BlockMark";
import { NAV_MARK_CELL, NAV_MARK_GAP } from "@/components/ui/block-mark";

const navItems = [
  { href: "#about", label: "about", id: "about" },
  { href: "#experience", label: "experience", id: "experience" },
  { href: "#skills", label: "skills", id: "skills" },
  { href: "#projects", label: "projects", id: "projects" },
  { href: "#contact", label: "contact", id: "contact" },
];

const clockFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function Nav({
  available,
  location,
}: {
  available: boolean;
  location: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const activationLine = 140;

    function updateActive() {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= activationLine) {
          current = id;
        }
      }
      setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  useEffect(() => {
    function tick() {
      setTime(clockFormatter.format(new Date()));
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2.5 px-4 py-3 font-mono text-xs sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <a
            href="#hero"
            className="flex shrink-0 items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <BlockMark
              data-nav-mark
              cell={NAV_MARK_CELL}
              gap={NAV_MARK_GAP}
              className="shrink-0"
              cellClassName="bg-foreground"
              accentClassName="bg-accent"
            />
            <span className="sr-only">Jon Stjärnström — home</span>
          </a>
          <span className="hidden items-center gap-1.5 whitespace-nowrap text-foreground/60 md:flex">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                available ? "bg-accent" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            status: {available ? "available" : "unavailable"}
          </span>
          <span className="hidden whitespace-nowrap text-foreground/60 lg:inline">
            {location.toLowerCase()}, se
          </span>
          {time ? (
            <span
              className="hidden whitespace-nowrap text-foreground/60 lg:inline"
              suppressHydrationWarning
            >
              {time}
            </span>
          ) : null}
        </div>
        <ul className="flex justify-between gap-x-2 text-[11px] sm:shrink-0 sm:justify-start sm:gap-5 sm:text-xs">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                    isActive
                      ? "font-medium text-accent"
                      : "text-foreground/70 hover:text-accent"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
