import { formatMoney } from "@/lib/format";
import type { RangeSummary } from "@/lib/summary";

interface SummaryCardsProps {
  summary: RangeSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:gap-3">
      {/* Métricas destacadas */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <HeroCard icon="$" label="Facturado" value={formatMoney(summary.totalFacturado)} />
        <HeroCard
          icon="%"
          label="Ocupación"
          value={`${summary.ocupacionPct.toFixed(0)}%`}
          hint={`${summary.nochesReservadas} / ${summary.nochesDisponibles} noches`}
        />
      </div>

      {/* Secundarias + chip de reservas activas */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <SummaryCard icon="✓" label="Cobrado" value={formatMoney(summary.totalCobrado)} />
        <SummaryCard
          icon="!"
          label="Pendiente de cobro"
          value={formatMoney(summary.totalPendiente)}
          accent={summary.totalPendiente > 0}
        />
        <div className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-cream/15 bg-ink-light/60 px-4 py-2.5 text-sm font-medium text-cream shadow-sm sm:col-span-1">
          <span aria-hidden="true" className="text-cream/50">
            #
          </span>
          {summary.reservasActivas} {summary.reservasActivas === 1 ? "reserva activa" : "reservas activas"}
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col gap-1 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-pine/20 text-sm font-bold text-cream/80"
        >
          {icon}
        </span>
        <p className="text-xs font-medium text-cream/60 sm:text-sm">{label}</p>
      </div>
      <p className="text-xl font-bold leading-tight text-cream sm:text-2xl">{value}</p>
      {hint && <p className="text-[11px] text-cream/50 sm:text-xs">{hint}</p>}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="card flex flex-col gap-1 p-3 sm:p-4">
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-pine/20 text-xs font-bold text-cream/80"
        >
          {icon}
        </span>
        <p className="text-xs font-medium text-cream/60">{label}</p>
      </div>
      <p
        className={`text-base font-semibold leading-tight sm:text-lg ${
          accent ? "text-estado-pendiente" : "text-cream"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
