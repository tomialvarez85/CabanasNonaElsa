"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Cabana } from "@/types/reserva";

interface CabanaTabsProps {
  cabanas: Cabana[];
  selectedCabanaId: string;
}

export default function CabanaTabs({ cabanas, selectedCabanaId }: CabanaTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectCabana(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cabana", id);
    router.push(`/?${params.toString()}`);
  }

  if (cabanas.length === 0) {
    return (
      <p className="card mb-4 px-4 py-3 text-sm text-cream/70">
        No hay cabañas cargadas todavía en la base de datos.
      </p>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Cabaña">
      {cabanas.map((cabana) => {
        const active = cabana.id === selectedCabanaId;
        return (
          <button
            key={cabana.id}
            role="tab"
            aria-selected={active}
            onClick={() => selectCabana(cabana.id)}
            className={`focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-medium shadow-sm transition active:scale-[0.98] ${
              active ? "bg-pine text-cream" : "bg-ink-light text-cream hover:bg-cream/10"
            }`}
          >
            {cabana.nombre}
          </button>
        );
      })}
    </div>
  );
}
