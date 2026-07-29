"use client";

import { useState, type FormEvent } from "react";
import type { EstadoPago, Reserva, ReservaInput } from "@/types/reserva";

interface ReservaFormProps {
  cabanaId: string;
  initial: Partial<Reserva>;
  reservaId?: string;
  onDone: () => void;
  onCancel: () => void;
}

export default function ReservaForm({
  cabanaId,
  initial,
  reservaId,
  onDone,
  onCancel,
}: ReservaFormProps) {
  const [checkIn, setCheckIn] = useState(initial.check_in ?? "");
  const [checkOut, setCheckOut] = useState(initial.check_out ?? "");
  const [huespedNombre, setHuespedNombre] = useState(initial.huesped_nombre ?? "");
  const [personas, setPersonas] = useState(String(initial.personas ?? 1));
  const [total, setTotal] = useState(String(initial.total ?? 0));
  const [sena, setSena] = useState(String(initial.sena ?? 0));
  const [estadoPago, setEstadoPago] = useState<EstadoPago>(initial.estado_pago ?? "pendiente");
  const [notas, setNotas] = useState(initial.notas ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: ReservaInput = {
      cabana_id: cabanaId,
      check_in: checkIn,
      check_out: checkOut,
      huesped_nombre: huespedNombre,
      personas: parseInt(personas, 10) || 1,
      total: parseFloat(total) || 0,
      sena: parseFloat(sena) || 0,
      estado_pago: estadoPago,
      notas: notas || null,
    };

    const url = reservaId ? `/api/reservas/${reservaId}` : "/api/reservas";
    const method = reservaId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "No se pudo guardar la reserva.");
      return;
    }

    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-pine">Check-in</label>
          <input
            type="date"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-pine">Check-out</label>
          <input
            type="date"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-pine">Huésped</label>
        <input
          type="text"
          required
          value={huespedNombre}
          onChange={(e) => setHuespedNombre(e.target.value)}
          className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-pine">Personas</label>
          <input
            type="number"
            min={1}
            required
            value={personas}
            onChange={(e) => setPersonas(e.target.value)}
            className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-pine">Total</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-pine">Seña</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={sena}
            onChange={(e) => setSena(e.target.value)}
            className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-pine">Estado de pago</label>
        <select
          value={estadoPago}
          onChange={(e) => setEstadoPago(e.target.value as EstadoPago)}
          className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
        >
          <option value="pendiente">Pendiente de seña</option>
          <option value="sena">Seña pagada</option>
          <option value="pagado">Pagado completo</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-pine">Notas</label>
        <textarea
          value={notas ?? ""}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full rounded border border-pine/30 bg-cream px-2 py-1.5 text-pine focus:border-pine focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-estado-pendiente">{error}</p>}

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-pine px-4 py-2 text-sm font-medium text-cream transition hover:bg-pine-light disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-pine/30 px-4 py-2 text-sm font-medium text-pine transition hover:bg-pine/10"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
