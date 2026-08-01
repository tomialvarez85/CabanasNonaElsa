export type CostoCategoria =
  | "Impuestos"
  | "Sueldos"
  | "Servicios"
  | "Mantenimiento"
  | "Insumos"
  | "Otro";

export type CostoFrecuencia = "mensual" | "anual";

export interface Costo {
  id: string;
  cabana_id: string | null;
  categoria: CostoCategoria;
  descripcion: string;
  monto: number;
  es_recurrente: boolean;
  frecuencia: CostoFrecuencia | null;
  fecha: string;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostoInput {
  cabana_id: string | null;
  categoria: CostoCategoria;
  descripcion: string;
  monto: number;
  es_recurrente: boolean;
  frecuencia: CostoFrecuencia | null;
  fecha: string;
  fecha_fin: string | null;
}
