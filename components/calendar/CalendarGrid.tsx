"use client";

import { useMemo, useState } from "react";
import { fromISO, getMonthGrid, isoWeekday, WEEKDAY_LABELS } from "@/lib/dates";
import { ESTADO_BG_CLASS, ESTADO_ICON, ESTADO_LABELS } from "@/lib/estado";
import type { Reserva } from "@/types/reserva";
import ReservaModal from "@/components/calendar/ReservaModal";

interface CalendarGridProps {
  year: number;
  month: number;
  cabanaId: string;
  reservas: Reserva[];
  todayISO: string;
}

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
      <p className="card px-4 py-6 text-center text-sm text-pine/70">
        Seleccioná una cabaña para ver el calendario.
      </p>
    );
  }

  return (
    <div>
      {reservas.length === 0 && (
        <div className="card mb-4 flex flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-medium text-pine">No hay reservas este mes</p>
            <p className="text-sm text-pine/60">Todos los días están disponibles todavía.</p>
          </div>
          <button onClick={() => setSelectedDay(defaultNewDateISO)} className="btn-primary shrink-0">
            <span aria-hidden="true">+</span> Nueva reserva
          </button>
        </div>
      )}

      {/* Mobile: lista de días (< sm) */}
      <div className="flex flex-col gap-2 sm:hidden">
        {grid
          .filter((cell) => cell.isCurrentMonth)
          .map((cell) => {
            const dayReservas = reservasByDay.get(cell.iso) ?? [];
            const hasOverlap = dayReservas.length > 1;
            const isToday = cell.iso === todayISO;
            const weekdayLabel = WEEKDAY_LABELS[isoWeekday(fromISO(cell.iso))];

            let badgeClass = "bg-estado-disponible text-pine/50";
            let icon: string | null = null;
            if (dayReservas.length === 1) {
              badgeClass = ESTADO_BG_CLASS[dayReservas[0].estado_pago];
              icon = ESTADO_ICON[dayReservas[0].estado_pago];
            } else if (hasOverlap) {
              badgeClass = "bg-estado-pendiente text-cream";
            }

            return (
              <button
                key={cell.iso}
                onClick={() => setSelectedDay(cell.iso)}
                className={`focus-ring flex min-h-[56px] items-center gap-3 rounded-lg border border-pine/10 bg-cream px-3 py-2 text-left shadow-sm transition active:scale-[0.99] ${
                  isToday ? "ring-2 ring-wood" : ""
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg font-semibold ${badgeClass}`}
                >
                  <span className="text-sm leading-none">{cell.day}</span>
                  <span className="text-[9px] font-normal uppercase leading-none opacity-80">
                    {weekdayLabel}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  {dayReservas.length === 0 ? (
                    <span className="text-sm text-pine/50">Disponible</span>
                  ) : (
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-pine">
                        {dayReservas.map((r) => r.huesped_nombre).join(", ")}
                      </span>
                      <span className="text-xs text-pine/60">
                        {hasOverlap
                          ? `${dayReservas.length} reservas superpuestas`
                          : ESTADO_LABELS[dayReservas[0].estado_pago]}
                      </span>
                    </div>
                  )}
                </div>

                {hasOverlap ? (
                  <span aria-hidden="true" className="shrink-0 text-lg text-estado-pendiente">
                    ⚠
                  </span>
                ) : (
                  icon && (
                    <span aria-hidden="true" className="shrink-0 text-lg text-pine/60">
                      {icon}
                    </span>
                  )
                )}
              </button>
            );
          })}
      </div>

      {/* sm y superior: grilla semanal */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-pine/70 sm:text-sm">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell) => {
            const dayReservas = reservasByDay.get(cell.iso) ?? [];
            const hasOverlap = dayReservas.length > 1;
            const isToday = cell.iso === todayISO;

            let bgClass = "bg-estado-disponible hover:bg-cream-dark";
            let icon: string | null = null;
            if (dayReservas.length === 1) {
              bgClass = ESTADO_BG_CLASS[dayReservas[0].estado_pago];
              icon = ESTADO_ICON[dayReservas[0].estado_pago];
            } else if (hasOverlap) {
              bgClass = "bg-estado-pendiente text-cream";
            }

            return (
              <button
                key={cell.iso}
                onClick={() => setSelectedDay(cell.iso)}
                className={`focus-ring relative flex aspect-square flex-col items-start justify-start rounded-lg p-1 text-left shadow-sm transition hover:shadow-md active:scale-[0.97] sm:p-2 ${bgClass} ${
                  cell.isCurrentMonth ? "" : "opacity-40"
                } ${isToday ? "ring-2 ring-wood ring-offset-1 ring-offset-cream" : ""}`}
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
                {dayReservas.length === 1 && (
                  <span className="mt-auto line-clamp-2 w-full break-words text-[10px] leading-tight sm:text-xs">
                    {dayReservas[0].huesped_nombre}
                  </span>
                )}
                {hasOverlap && (
                  <span className="mt-auto line-clamp-2 w-full break-words text-[10px] leading-tight sm:text-xs">
                    {dayReservas.map((r) => r.huesped_nombre).join(", ")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-pine/80 sm:text-sm">
        <LegendItem colorClass="bg-estado-disponible border border-pine/20" label="Disponible" />
        <LegendItem colorClass="bg-estado-pendiente text-cream" label="Pendiente de seña" icon="!" />
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
