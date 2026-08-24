"use client";

import { useEffect, useState } from "react";

const navItems = [
  { href: "#about", label: "About", id: "about" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#skills", label: "Skills", id: "skills" },
  { href: "#contact", label: "Contact", id: "contact" },
];

export function Nav() {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <a
          href="#hero"
          className="rounded font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span className="hidden sm:inline">Jon Stjärnström</span>
          <span className="sm:hidden" aria-hidden="true">
            JS
          </span>
          <span className="sr-only sm:hidden">Jon Stjärnström</span>
        </a>
        <ul className="flex gap-3 text-sm sm:gap-6">
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
      </nav>
    </header>
  );
}
