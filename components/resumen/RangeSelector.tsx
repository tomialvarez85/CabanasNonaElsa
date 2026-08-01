"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface RangeSelectorProps {
  preset: string;
  desde: string;
  hasta: string;
}

const PRESETS = [
  { value: "mes_actual", label: "Mes actual" },
  { value: "temporada", label: "Temporada completa" },
  { value: "custom", label: "Rango personalizado" },
];

export default function RangeSelector({ preset, desde, hasta }: RangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPreset(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", next);
    router.push(`/resumen-general?${params.toString()}`);
  }

  function setCustomDate(key: "desde" | "hasta", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", "custom");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/resumen-general?${params.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-wrap items-end gap-3">
      <div className="inline-flex rounded-full border border-cream/20 bg-ink-light p-0.5 shadow-sm">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={`focus-ring rounded-full px-3 py-1.5 text-sm font-medium transition ${
              preset === p.value ? "bg-pine text-cream" : "text-cream hover:bg-cream/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <>
          <div>
            <label className="field-label text-xs">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setCustomDate("desde", e.target.value)}
              className="input-field w-auto py-1.5"
            />
          </div>
          <div>
            <label className="field-label text-xs">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setCustomDate("hasta", e.target.value)}
              className="input-field w-auto py-1.5"
            />
          </div>
        </>
      )}
    </div>
  );
}
