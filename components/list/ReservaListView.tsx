"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatShortDate, MONTH_LABELS, nightsBetween, todayISO } from "@/lib/dates";
import { ESTADO_BG_CLASS, ESTADO_DOT_CLASS, ESTADO_ICON, ESTADO_LABELS } from "@/lib/estado";
import { formatMoney } from "@/lib/format";
import { deleteReserva } from "@/lib/reservas-client";
import { useToast } from "@/components/ui/ToastProvider";
import ReservaEditModal from "@/components/calendar/ReservaEditModal";
import ReservaModal from "@/components/calendar/ReservaModal";
import type { Reserva } from "@/types/reserva";

interface ReservaListViewProps {
  cabanaId: string;
  reservas: Reserva[];
}

export default function ReservaListView({ cabanaId, reservas }: ReservaListViewProps) {
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const groups = useMemo(() => {
    const map = new Map<string, Reserva[]>();
    for (const reserva of reservas) {
      const key = reserva.check_in.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push(reserva);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [reservas]);

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que querés eliminar esta reserva? No se puede deshacer.")) return;
    setDeletingId(id);
    const err = await deleteReserva(id);
    setDeletingId(null);
    if (err) {
      showToast("error", err);
      return;
    }
    showToast("success", "Reserva eliminada.");
    router.refresh();
  }

  if (reservas.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-4 py-8 text-center">
        <p className="font-medium text-pine">No hay reservas para los filtros seleccionados</p>
        <p className="text-sm text-pine/60">Probá ajustar el rango de fechas o el estado filtrado.</p>
        {cabanaId && (
          <button
            onClick={() => setCreating(true)}
            className="focus-ring mt-1 rounded px-1 text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4 transition hover:text-pine-light"
          >
            + Cargar una reserva
          </button>
        )}
        {creating && (
          <ReservaModal
            cabanaId={cabanaId}
            dateISO={todayISO()}
            reservas={[]}
            onClose={() => setCreating(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(([key, groupReservas]) => {
        const [yearStr, monthStr] = key.split("-");
        const label = `${MONTH_LABELS[parseInt(monthStr, 10) - 1]} ${yearStr}`;

        return (
          <section key={key}>
            <h3 className="rounded-lg bg-pine px-3 py-1.5 text-sm font-semibold text-cream shadow-sm sm:text-base">
              {label}
            </h3>

            {/* Mobile: tarjetas (< sm) */}
            <div className="mt-2 flex flex-col gap-2 sm:hidden">
              {groupReservas.map((reserva) => {
                const saldo = reserva.total - reserva.sena;
                return (
                  <div key={reserva.id} className="card p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-pine">{reserva.huesped_nombre}</p>
                        <p className="text-xs text-pine/60">
                          {formatShortDate(reserva.check_in)} → {formatShortDate(reserva.check_out)} ·{" "}
                          {nightsBetween(reserva.check_in, reserva.check_out)} noches · {reserva.personas}{" "}
                          pers.
                        </p>
                      </div>
                      <span
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${ESTADO_BG_CLASS[reserva.estado_pago]}`}
                      >
                        <span aria-hidden="true">{ESTADO_ICON[reserva.estado_pago]}</span>
                        {ESTADO_LABELS[reserva.estado_pago]}
                      </span>
                    </div>
                    <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-[11px] text-pine/50">Total</p>
                        <p className="font-medium text-pine">{formatMoney(reserva.total)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-pine/50">Seña</p>
                        <p className="font-medium text-pine">{formatMoney(reserva.sena)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-pine/50">Saldo</p>
                        <p
                          className={`font-medium ${saldo > 0 ? "text-estado-pendiente" : "text-pine"}`}
                        >
                          {formatMoney(saldo)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReserva(reserva)}
                        className="btn-secondary flex-1 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(reserva.id)}
                        disabled={deletingId === reserva.id}
                        className="btn-danger flex-1 text-sm"
                      >
                        {deletingId === reserva.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* sm y superior: tabla */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="mt-2 w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-pine/20 text-left text-pine/60">
                    <th className="py-2 pr-3 font-medium">Fecha</th>
                    <th className="py-2 pr-3 font-medium">Noches</th>
                    <th className="py-2 pr-3 font-medium">Personas</th>
                    <th className="py-2 pr-3 font-medium">Huésped</th>
                    <th className="py-2 pr-3 font-medium">Total</th>
                    <th className="py-2 pr-3 font-medium">Seña</th>
                    <th className="py-2 pr-3 font-medium">Saldo</th>
                    <th className="py-2 pr-3 font-medium">Estado</th>
                    <th className="py-2 pr-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {groupReservas.map((reserva) => {
                    const saldo = reserva.total - reserva.sena;
                    return (
                      <tr key={reserva.id} className="border-b border-pine/10">
                        <td className="whitespace-nowrap py-2 pr-3 text-pine">
                          {formatShortDate(reserva.check_in)} → {formatShortDate(reserva.check_out)}
                        </td>
                        <td className="py-2 pr-3 text-pine">
                          {nightsBetween(reserva.check_in, reserva.check_out)}
                        </td>
                        <td className="py-2 pr-3 text-pine">{reserva.personas}</td>
                        <td className="py-2 pr-3 text-pine">{reserva.huesped_nombre}</td>
                        <td className="whitespace-nowrap py-2 pr-3 text-pine">
                          {formatMoney(reserva.total)}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 text-pine">
                          {formatMoney(reserva.sena)}
                        </td>
                        <td
                          className={`whitespace-nowrap py-2 pr-3 ${
                            saldo > 0 ? "font-medium text-estado-pendiente" : "text-pine"
                          }`}
                        >
                          {formatMoney(saldo)}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3">
                          <span className="flex items-center gap-1.5 text-pine">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${ESTADO_DOT_CLASS[reserva.estado_pago]}`}
                              aria-hidden="true"
                            />
                            {ESTADO_LABELS[reserva.estado_pago]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingReserva(reserva)}
                              className="focus-ring rounded-lg border border-pine/30 px-2 py-1 text-xs font-medium text-pine transition hover:bg-pine/10"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(reserva.id)}
                              disabled={deletingId === reserva.id}
                              className="focus-ring rounded-lg border border-estado-pendiente/50 px-2 py-1 text-xs font-medium text-estado-pendiente transition hover:bg-estado-pendiente/10 disabled:opacity-60"
                            >
                              {deletingId === reserva.id ? "..." : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {editingReserva && (
        <ReservaEditModal reserva={editingReserva} onClose={() => setEditingReserva(null)} />
      )}
    </div>
  );
}
