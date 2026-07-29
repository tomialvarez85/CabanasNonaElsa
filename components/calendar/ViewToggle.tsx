"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ViewToggleProps {
  view: "calendar" | "list";
}

export default function ViewToggle({ view }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setView(next: "calendar" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="mb-4 inline-flex rounded-full border border-pine/30 bg-cream p-0.5 shadow-sm">
      <button
        onClick={() => setView("calendar")}
        aria-pressed={view === "calendar"}
        className={`focus-ring inline-flex min-h-[40px] items-center justify-center rounded-full px-3 text-sm font-medium transition ${
          view === "calendar" ? "bg-pine text-cream" : "text-pine hover:bg-pine/10"
        }`}
      >
        Vista calendario
      </button>
      <button
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        className={`focus-ring inline-flex min-h-[40px] items-center justify-center rounded-full px-3 text-sm font-medium transition ${
          view === "list" ? "bg-pine text-cream" : "text-pine hover:bg-pine/10"
        }`}
      >
        Vista lista
      </button>
    </div>
  );
}
