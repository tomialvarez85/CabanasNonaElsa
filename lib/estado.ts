import type { EstadoPago } from "@/types/reserva";

export const ESTADO_LABELS: Record<EstadoPago, string> = {
  pendiente: "Pendiente de seña",
  sena: "Seña pagada",
  pagado: "Pagado completo",
};

export const ESTADO_BG_CLASS: Record<EstadoPago, string> = {
  pendiente: "bg-estado-pendiente text-pine",
  sena: "bg-estado-sena text-pine",
  pagado: "bg-estado-pagado text-pine",
};

export const ESTADO_DOT_CLASS: Record<EstadoPago, string> = {
  pendiente: "bg-estado-pendiente",
  sena: "bg-estado-sena",
  pagado: "bg-estado-pagado",
};

/**
 * Ícono por estado, para no depender solo del color (accesibilidad para
 * daltonismo): pendiente = alerta, seña = a mitad de camino, pagado = check.
 */
export const ESTADO_ICON: Record<EstadoPago, string> = {
  pendiente: "!",
  sena: "◐",
  pagado: "✓",
};
