import { formatMoney } from "@/lib/format";

interface CostosSummaryCardsProps {
  costosTotales: number;
  gananciaNeta: number;
}

export default function CostosSummaryCards({ costosTotales, gananciaNeta }: CostosSummaryCardsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
      <div className="card flex flex-col gap-1 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-pine/20 text-sm font-bold text-cream/80"
          >
            −
          </span>
          <p className="text-xs font-medium text-cream/60 sm:text-sm">Costos totales</p>
        </div>
        <p className="text-xl font-bold leading-tight text-cream sm:text-2xl">
          {formatMoney(costosTotales)}
        </p>
      </div>

      <div className="card flex flex-col gap-1 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-pine/20 text-sm font-bold text-cream/80"
          >
            =
          </span>
          <p className="text-xs font-medium text-cream/60 sm:text-sm">Ganancia neta</p>
        </div>
        <p
          className={`text-xl font-bold leading-tight sm:text-2xl ${
            gananciaNeta < 0 ? "text-estado-pendiente" : "text-cream"
          }`}
        >
          {formatMoney(gananciaNeta)}
        </p>
      </div>
    </div>
  );
}
