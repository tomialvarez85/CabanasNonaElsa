"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* sm y superior: como antes, links en línea */}
      <div className="hidden items-center gap-4 sm:flex">
        <Link
          href="/resumen-general"
          className="text-sm font-medium text-cream/90 transition hover:text-cream hover:underline"
        >
          Resumen general
        </Link>
        <LogoutButton />
      </div>

      {/* Mobile: menú compacto */}
      <div ref={containerRef} className="relative sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Abrir menú"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg text-cream transition hover:bg-cream/10"
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ☰
          </span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-pine/15 bg-cream p-1.5 shadow-lg"
          >
            <Link
              href="/resumen-general"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="focus-ring block rounded-lg px-3 py-2.5 text-sm font-medium text-pine transition hover:bg-pine/10"
            >
              Resumen general
            </Link>
            <div className="mt-1 border-t border-pine/10 pt-1">
              <LogoutButton variant="menu" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
