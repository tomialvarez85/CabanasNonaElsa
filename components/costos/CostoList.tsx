"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatShortDate } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { deleteCosto } from "@/lib/costos-client";
import CostoModal from "@/components/costos/CostoModal";
import type { Cabana } from "@/types/reserva";
import type { Costo } from "@/types/costo";

interface CostoListProps {
  costos: Costo[];
  cabanas: Cabana[];
  cabanaNombreById: Map<string, string>;
  variant: "recurrente" | "puntual";
  emptyMessage: string;
}

export default function CostoList({
  costos,
  cabanas,
  cabanaNombreById,
  variant,
  emptyMessage,
}: CostoListProps) {
  const [editing, setEditing] = useState<Costo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que querés eliminar este costo? No se puede deshacer.")) return;
    setDeletingId(id);
    setError(null);
    const err = await deleteCosto(id);
    setDeletingId(null);
    if (err) {
      setError(err);
      return;
    }
    router.refresh();
  }

  if (costos.length === 0) {
    return <p className="card px-4 py-6 text-center text-sm text-cream/60">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-estado-pendiente">{error}</p>}

      {costos.map((costo) => {
        const cabanaLabel = costo.cabana_id
          ? (cabanaNombreById.get(costo.cabana_id) ?? "Cabaña")
          : "Compartido";

        return (
          <div
            key={costo.id}
            className="card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-cream">{costo.descripcion}</p>
                <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[11px] font-medium text-cream/80">
                  {costo.categoria}
                </span>
                <span className="rounded-full bg-pine/25 px-2 py-0.5 text-[11px] font-medium text-cream/80">
                  {cabanaLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-cream/60">
                {variant === "recurrente"
                  ? `Desde ${formatShortDate(costo.fecha)}${
                      costo.fecha_fin ? ` hasta ${formatShortDate(costo.fecha_fin)}` : " · activo"
                    }`
                  : formatShortDate(costo.fecha)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <p className="whitespace-nowrap text-base font-semibold text-cream">
                {formatMoney(costo.monto)}
                {variant === "recurrente" && (
                  <span className="text-xs font-normal text-cream/50">
                    {costo.frecuencia === "mensual" ? " /mes" : " /año"}
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(costo)}
                  className="focus-ring rounded-lg border border-cream/30 px-2 py-1 text-xs font-medium text-cream transition hover:bg-cream/10"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(costo.id)}
                  disabled={deletingId === costo.id}
                  className="focus-ring rounded-lg border border-estado-pendiente/50 px-2 py-1 text-xs font-medium text-estado-pendiente transition hover:bg-estado-pendiente/10 disabled:opacity-60"
                >
                  {deletingId === costo.id ? "..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {editing && (
        <CostoModal cabanas={cabanas} costo={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
