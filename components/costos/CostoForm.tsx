"use client";

import { useState, type FormEvent } from "react";
import type { Cabana } from "@/types/reserva";
import type { Costo, CostoCategoria, CostoFrecuencia, CostoInput } from "@/types/costo";

interface CostoFormProps {
  cabanas: Cabana[];
  initial: Partial<Costo>;
  costoId?: string;
  onDone: () => void;
  onCancel: () => void;
}

const CATEGORIAS: CostoCategoria[] = [
  "Impuestos",
  "Sueldos",
  "Servicios",
  "Mantenimiento",
  "Insumos",
  "Otro",
];

export default function CostoForm({ cabanas, initial, costoId, onDone, onCancel }: CostoFormProps) {
  const [cabanaId, setCabanaId] = useState(initial.cabana_id ?? "");
  const [categoria, setCategoria] = useState<CostoCategoria>(initial.categoria ?? "Otro");
  const [descripcion, setDescripcion] = useState(initial.descripcion ?? "");
  const [monto, setMonto] = useState(String(initial.monto ?? 0));
  const [esRecurrente, setEsRecurrente] = useState(initial.es_recurrente ?? false);
  const [frecuencia, setFrecuencia] = useState<CostoFrecuencia>(initial.frecuencia ?? "mensual");
  const [fecha, setFecha] = useState(initial.fecha ?? "");
  const [fechaFin, setFechaFin] = useState(initial.fecha_fin ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: CostoInput = {
      cabana_id: cabanaId || null,
      categoria,
      descripcion,
      monto: parseFloat(monto) || 0,
      es_recurrente: esRecurrente,
      frecuencia: esRecurrente ? frecuencia : null,
      fecha,
      fecha_fin: esRecurrente && fechaFin ? fechaFin : null,
    };

    const url = costoId ? `/api/costos/${costoId}` : "/api/costos";
    const method = costoId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "No se pudo guardar el costo.");
      return;
    }

    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="field-label">Cabaña</label>
        <select value={cabanaId} onChange={(e) => setCabanaId(e.target.value)} className="input-field">
          <option value="">Compartido (ambas cabañas)</option>
          {cabanas.map((cabana) => (
            <option key={cabana.id} value={cabana.id}>
              {cabana.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CostoCategoria)}
          className="input-field"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Descripción</label>
        <input
          type="text"
          required
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label className="field-label">Monto</label>
        <input
          type="number"
          min={0}
          step="0.01"
          required
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="input-field"
        />
      </div>

      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-cream">
        <input
          type="checkbox"
          checked={esRecurrente}
          onChange={(e) => setEsRecurrente(e.target.checked)}
          className="focus-ring h-5 w-5 rounded border-cream/30 accent-pine"
        />
        ¿Es un gasto recurrente?
      </label>

      {esRecurrente ? (
        <>
          <div>
            <label className="field-label">Frecuencia</label>
            <select
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value as CostoFrecuencia)}
              className="input-field"
            >
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Desde</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="field-label">Hasta (opcional)</label>
              <input
                type="date"
                value={fechaFin ?? ""}
                onChange={(e) => setFechaFin(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </>
      ) : (
        <div>
          <label className="field-label">Fecha</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input-field"
          />
        </div>
      )}

      {error && <p className="text-sm text-estado-pendiente">{error}</p>}

      <div className="mt-1 flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
