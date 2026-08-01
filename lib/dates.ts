export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const WEEKDAY_LABELS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

export const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export interface DayCell {
  iso: string;
  day: number;
  isCurrentMonth: boolean;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toISO(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// Lunes = 0 ... Domingo = 6
export function isoWeekday(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function fromISO(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = fromISO(checkIn).getTime();
  const b = fromISO(checkOut).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Grilla de días para un mes (year, month 1-12), completada con los días de
 * las semanas adyacentes para que empiece en lunes y termine en domingo.
 */
export function getMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastOfMonth = new Date(Date.UTC(year, month, 0));

  const gridStart = addDays(firstOfMonth, -isoWeekday(firstOfMonth));
  const gridEnd = addDays(lastOfMonth, 6 - isoWeekday(lastOfMonth));

  const cells: DayCell[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    cells.push({
      iso: toISO(d),
      day: d.getUTCDate(),
      isCurrentMonth: d.getUTCMonth() === month - 1 && d.getUTCFullYear() === year,
    });
  }
  return cells;
}

/** Rango a traer de la base: la grilla visible más una semana de margen a cada lado. */
export function getFetchRange(grid: DayCell[]): { startISO: string; endISO: string } {
  const gridStart = new Date(`${grid[0].iso}T00:00:00Z`);
  const gridEnd = new Date(`${grid[grid.length - 1].iso}T00:00:00Z`);
  return {
    startISO: toISO(addDays(gridStart, -7)),
    endISO: toISO(addDays(gridEnd, 8)),
  };
}

export function clampMonth(month: number): number {
  if (Number.isNaN(month) || month < 1) return 1;
  if (month > 12) return 12;
  return month;
}

export function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}
