"use client";

import { useEffect, useState } from "react";
import { Mark } from "@/components/ui/Mark";

const navItems = [
  { href: "#about", label: "About", id: "about" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#skills", label: "Skills", id: "skills" },
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#contact", label: "Contact", id: "contact" },
];

export function Nav({
  available,
  location,
}: {
  available: boolean;
  location: string;
}) {
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
        if (el.getBoundingClientRect().top <= activationLine) current = id;
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
    <header className="sticky top-0 z-40 border-b border-field-fg/15 bg-field text-field-fg">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 sm:justify-start">
          <a
            href="#hero"
            className="flex shrink-0 items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-field-fg"
          >
            <Mark decorative className="bg-paper text-field" />
            <span className="sr-only">Jon Stjärnström — home</span>
          </a>
          {available ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan px-3 py-1 text-xs font-semibold text-cyan-fg">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-fg" aria-hidden="true" />
              Available for work
            </span>
          ) : null}
          <span className="hidden whitespace-nowrap text-field-fg/80 lg:inline">
            {location}, Sweden
          </span>
        </div>
        <ul className="flex justify-between gap-x-2 sm:shrink-0 sm:justify-start sm:gap-5">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg ${
                    isActive
                      ? "font-semibold text-cyan"
                      : "text-field-fg/80 hover:text-cyan"
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
