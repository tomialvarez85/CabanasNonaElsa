"use client";

import { useMemo, useState } from "react";
import { getMonthGrid, WEEKDAY_LABELS, WEEKDAY_LABELS_SHORT } from "@/lib/dates";
import { ESTADO_BG_CLASS, ESTADO_ICON } from "@/lib/estado";
import type { Reserva } from "@/types/reserva";
import ReservaModal from "@/components/calendar/ReservaModal";

interface CalendarGridProps {
  year: number;
  month: number;
  cabanaId: string;
  reservas: Reserva[];
  todayISO: string;
}

const DISPONIBLE_BG_CLASS = "bg-ink-light border border-cream/10 text-cream hover:bg-cream/10";

export default function CalendarGrid({
  year,
  month,
  cabanaId,
  reservas,
  todayISO,
}: CalendarGridProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const reservasByDay = useMemo(() => {
    const map = new Map<string, Reserva[]>();
    for (const cell of grid) {
      const dayReservas = reservas.filter((r) => cell.iso >= r.check_in && cell.iso < r.check_out);
      if (dayReservas.length > 0) map.set(cell.iso, dayReservas);
    }
    return map;
  }, [grid, reservas]);

  const defaultNewDateISO = useMemo(() => {
    const todayInMonth = grid.find((c) => c.isCurrentMonth && c.iso === todayISO);
    if (todayInMonth) return todayISO;
    return grid.find((c) => c.isCurrentMonth)?.iso ?? todayISO;
  }, [grid, todayISO]);

  if (!cabanaId) {
    return (
      <p className="card px-4 py-6 text-center text-sm text-cream/70">
        Seleccioná una cabaña para ver el calendario.
      </p>
    );
  }

  return (
    <div>
      {reservas.length === 0 && (
        <div className="card mb-4 flex flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-cream">No hay reservas este mes</p>
            <p className="text-sm text-cream/60">Todos los días están disponibles todavía.</p>
          </div>
          <button
            onClick={() => setSelectedDay(defaultNewDateISO)}
            className="focus-ring shrink-0 rounded px-1 text-sm font-medium text-cream underline decoration-cream/40 underline-offset-4 transition hover:text-white"
          >
            + Cargar una reserva
          </button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-cream/70 sm:text-sm">
        {WEEKDAY_LABELS.map((label, index) => (
          <div key={label} className="py-1">
            <span className="sm:hidden">{WEEKDAY_LABELS_SHORT[index]}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell) => {
          const dayReservas = reservasByDay.get(cell.iso) ?? [];
          const hasOverlap = dayReservas.length > 1;
          const isToday = cell.iso === todayISO;

          let bgClass = DISPONIBLE_BG_CLASS;
          let icon: string | null = null;
          if (dayReservas.length === 1) {
            bgClass = ESTADO_BG_CLASS[dayReservas[0].estado_pago];
            icon = ESTADO_ICON[dayReservas[0].estado_pago];
          } else if (hasOverlap) {
            bgClass = "bg-estado-pendiente text-pine";
          }

          return (
            <button
              key={cell.iso}
              onClick={() => setSelectedDay(cell.iso)}
              className={`focus-ring relative flex aspect-square min-h-[44px] flex-col items-start justify-start rounded-lg p-1 text-left shadow-sm transition hover:shadow-md active:scale-[0.97] sm:p-2 ${bgClass} ${
                cell.isCurrentMonth ? "" : "opacity-40"
              } ${isToday ? "ring-2 ring-wood-light ring-offset-1 ring-offset-ink" : ""}`}
            >
              <div className="flex w-full items-start justify-between">
                <span className="text-xs font-semibold sm:text-sm">{cell.day}</span>
                {hasOverlap && (
                  <span className="text-xs sm:text-sm" title="Reservas superpuestas" aria-hidden="true">
                    ⚠
                  </span>
                )}
                {!hasOverlap && icon && (
                  <span className="text-xs opacity-80 sm:text-sm" aria-hidden="true">
                    {icon}
                  </span>
                )}
              </div>

              {/* Nombre del huésped: no entra en la celda en mobile, se ve al tocar el día */}
              {dayReservas.length === 1 && (
                <span className="mt-auto hidden w-full break-words text-xs leading-tight sm:line-clamp-2 sm:block">
                  {dayReservas[0].huesped_nombre}
                </span>
              )}
              {hasOverlap && (
                <span className="mt-auto hidden w-full break-words text-xs leading-tight sm:line-clamp-2 sm:block">
                  {dayReservas.map((r) => r.huesped_nombre).join(", ")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-cream/80 sm:text-sm">
        <LegendItem colorClass="bg-ink-light border border-cream/20" label="Disponible" />
        <LegendItem colorClass="bg-estado-pendiente text-pine" label="Pendiente de seña" icon="!" />
        <LegendItem colorClass="bg-estado-sena text-pine" label="Seña pagada" icon="◐" />
        <LegendItem colorClass="bg-estado-pagado text-pine" label="Pagado completo" icon="✓" />
      </div>

      {selectedDay && (
        <ReservaModal
          cabanaId={cabanaId}
          dateISO={selectedDay}
          reservas={reservasByDay.get(selectedDay) ?? []}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function LegendItem({
  colorClass,
  label,
  icon,
}: {
  colorClass: string;
  label: string;
  icon?: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none ${colorClass}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </span>
  );
}
