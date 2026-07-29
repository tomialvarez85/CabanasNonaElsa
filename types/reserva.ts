export type EstadoPago = "pendiente" | "sena" | "pagado";

export interface Cabana {
  id: string;
  nombre: string;
}

export interface Reserva {
  id: string;
  cabana_id: string;
  check_in: string;
  check_out: string;
  huesped_nombre: string;
  personas: number;
  total: number;
  sena: number;
  estado_pago: EstadoPago;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservaConCabana extends Reserva {
  cabana: Cabana | null;
}

export interface ReservaInput {
  cabana_id: string;
  check_in: string;
  check_out: string;
  huesped_nombre: string;
  personas: number;
  total: number;
  sena: number;
  estado_pago: EstadoPago;
  notas: string | null;
}
