"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { Mark } from "@/components/ui/Mark";

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

export function Nav() {
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
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 font-mono text-xs sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <a
            href="#hero"
            className="flex shrink-0 items-center gap-2 rounded font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <Mark className="h-5 w-5 shrink-0" />
            <span className="hidden sm:inline">Jon Stjärnström</span>
            <span className="sr-only sm:hidden">Jon Stjärnström</span>
          </a>
          <span className="hidden items-center gap-1.5 whitespace-nowrap text-foreground/60 md:flex">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden="true"
            />
            status: {profile.contact.availableForConsulting ? "available" : "unavailable"}
          </span>
          <span className="hidden whitespace-nowrap text-foreground/60 lg:inline">
            {profile.contact.location.toLowerCase()}, se
          </span>
          {time ? (
            <span className="hidden whitespace-nowrap text-foreground/60 lg:inline" suppressHydrationWarning>
              {time}
            </span>
          ) : null}
        </div>
        <ul className="flex gap-3 sm:gap-5">
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
