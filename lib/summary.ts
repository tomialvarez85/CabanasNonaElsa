import { MONTH_LABELS, nightsBetween, toISO } from "@/lib/dates";
import type { Reserva } from "@/types/reserva";

export interface RangeSummary {
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  nochesReservadas: number;
  nochesDisponibles: number;
  ocupacionPct: number;
  reservasActivas: number;
}

/**
 * Resumen para un rango [rangeStartISO, rangeEndExclusiveISO). Los montos
 * (total/seña) se suman completos por reserva; las noches se recortan al
 * rango para que la ocupación no cuente noches que caen afuera.
 */
export function computeRangeSummary(
  reservas: Reserva[],
  rangeStartISO: string,
  rangeEndExclusiveISO: string,
): RangeSummary {
  const nochesDisponibles = nightsBetween(rangeStartISO, rangeEndExclusiveISO);

  const overlapping = reservas.filter(
    (r) => r.check_in < rangeEndExclusiveISO && r.check_out > rangeStartISO,
  );

  let totalFacturado = 0;
  let totalCobrado = 0;
  let nochesReservadas = 0;

  for (const reserva of overlapping) {
    totalFacturado += reserva.total;
    totalCobrado += reserva.sena;

    const clippedStart = reserva.check_in > rangeStartISO ? reserva.check_in : rangeStartISO;
    const clippedEnd =
      reserva.check_out < rangeEndExclusiveISO ? reserva.check_out : rangeEndExclusiveISO;
    nochesReservadas += nightsBetween(clippedStart, clippedEnd);
  }

  return {
    totalFacturado,
    totalCobrado,
    totalPendiente: totalFacturado - totalCobrado,
    nochesReservadas,
    nochesDisponibles,
    ocupacionPct: nochesDisponibles > 0 ? (nochesReservadas / nochesDisponibles) * 100 : 0,
    reservasActivas: overlapping.length,
  };
}

/** Resumen para un mes puntual (year, month 1-12); atajo sobre computeRangeSummary. */
export function computeMonthSummary(
  reservas: Reserva[],
  year: number,
  month: number,
): RangeSummary {
  const monthStart = toISO(new Date(Date.UTC(year, month - 1, 1)));
  const monthEndExclusive = toISO(new Date(Date.UTC(year, month, 1)));
  return computeRangeSummary(reservas, monthStart, monthEndExclusive);
}

/**
 * Combina varios RangeSummary (uno por cabaña) sumando montos, noches y
 * reservas, y recalculando el % de ocupación sobre los totales combinados
 * (no como promedio simple de porcentajes).
 */
export function combineRangeSummaries(summaries: RangeSummary[]): RangeSummary {
  const totalFacturado = summaries.reduce((sum, s) => sum + s.totalFacturado, 0);
  const totalCobrado = summaries.reduce((sum, s) => sum + s.totalCobrado, 0);
  const nochesReservadas = summaries.reduce((sum, s) => sum + s.nochesReservadas, 0);
  const nochesDisponibles = summaries.reduce((sum, s) => sum + s.nochesDisponibles, 0);
  const reservasActivas = summaries.reduce((sum, s) => sum + s.reservasActivas, 0);

  return {
    totalFacturado,
    totalCobrado,
    totalPendiente: totalFacturado - totalCobrado,
    nochesReservadas,
    nochesDisponibles,
    ocupacionPct: nochesDisponibles > 0 ? (nochesReservadas / nochesDisponibles) * 100 : 0,
    reservasActivas,
  };
}

export interface MonthlyRevenuePoint {
  month: string;
  label: string;
  [cabanaNombre: string]: string | number;
}

/**
 * Agrupa la facturación (total completo) por mes de check-in y por cabaña,
 * pensado como datos de entrada para un gráfico de barras comparativo.
 * Rellena con 0 las combinaciones mes/cabaña sin reservas para que todas
 * las barras tengan las mismas series.
 */
export function computeMonthlyRevenueByCabana(
  reservas: { check_in: string; total: number; cabanaNombre: string }[],
  cabanaNombres: string[],
): MonthlyRevenuePoint[] {
  const map = new Map<string, Record<string, number>>();
  for (const reserva of reservas) {
    const key = reserva.check_in.slice(0, 7);
    const entry = map.get(key) ?? {};
    entry[reserva.cabanaNombre] = (entry[reserva.cabanaNombre] ?? 0) + reserva.total;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => {
      const [year, month] = key.split("-");
      const filled: Record<string, number> = {};
      for (const nombre of cabanaNombres) filled[nombre] = values[nombre] ?? 0;
      return {
        month: key,
        label: `${MONTH_LABELS[parseInt(month, 10) - 1].slice(0, 3)} ${year}`,
        ...filled,
      };
    });
}
