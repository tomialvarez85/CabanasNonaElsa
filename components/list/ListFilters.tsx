"use client";

import { useRouter, useSearchParams } from "next/navigation";

const ESTADO_OPTIONS = [
  { value: "todos", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente de seña" },
  { value: "sena", label: "Seña pagada" },
  { value: "pagado", label: "Pagado completo" },
];

interface ListFiltersProps {
  desde: string;
  hasta: string;
  estado: string;
}

export default function ListFilters({ desde, hasta, estado }: ListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("desde");
    params.delete("hasta");
    params.delete("estado");
    router.push(`/?${params.toString()}`);
  }

  const hasActiveFilters = Boolean(desde || hasta || (estado && estado !== "todos"));

  return (
    <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
      <div className="flex-1 sm:max-w-[160px]">
        <label className="field-label" htmlFor="filtro-desde">
          Desde
        </label>
        <input
          id="filtro-desde"
          type="date"
          value={desde}
          onChange={(e) => updateParam("desde", e.target.value)}
          className="input-field"
        />
      </div>
      <div className="flex-1 sm:max-w-[160px]">
        <label className="field-label" htmlFor="filtro-hasta">
          Hasta
        </label>
        <input
          id="filtro-hasta"
          type="date"
          value={hasta}
          onChange={(e) => updateParam("hasta", e.target.value)}
          className="input-field"
        />
      </div>
      <div className="flex-1 sm:max-w-[220px]">
        <label className="field-label" htmlFor="filtro-estado">
          Estado
        </label>
        <select
          id="filtro-estado"
          value={estado}
          onChange={(e) => updateParam("estado", e.target.value)}
          className="input-field"
        >
          {ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <button onClick={clearFilters} className="btn-secondary">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
