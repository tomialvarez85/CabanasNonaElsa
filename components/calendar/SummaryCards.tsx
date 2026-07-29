import { formatMoney } from "@/lib/format";
import type { RangeSummary } from "@/lib/summary";

interface SummaryCardsProps {
  summary: RangeSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      <SummaryCard icon="$" label="Facturado" value={formatMoney(summary.totalFacturado)} />
      <SummaryCard icon="✓" label="Cobrado" value={formatMoney(summary.totalCobrado)} />
      <SummaryCard
        icon="!"
        label="Pendiente de cobro"
        value={formatMoney(summary.totalPendiente)}
        accent={summary.totalPendiente > 0}
      />
      <SummaryCard
        icon="%"
        label="Ocupación"
        value={`${summary.ocupacionPct.toFixed(0)}%`}
        hint={`${summary.nochesReservadas} / ${summary.nochesDisponibles} noches`}
      />
      <SummaryCard icon="#" label="Reservas activas" value={String(summary.reservasActivas)} />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="card flex flex-col gap-1 p-3 sm:p-4">
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-pine/10 text-xs font-bold text-pine/70"
        >
          {icon}
        </span>
        <p className="text-xs font-medium text-pine/60 sm:text-sm">{label}</p>
      </div>
      <p
        className={`text-lg font-semibold leading-tight sm:text-xl ${
          accent ? "text-estado-pendiente" : "text-pine"
        }`}
      >
        {value}
      </p>
      {hint && <p className="text-[11px] text-pine/50">{hint}</p>}
    </div>
  );
}
