import { formatMoney } from "@/lib/format";
import type { RangeSummary } from "@/lib/summary";
import type { Cabana } from "@/types/reserva";

interface CabanaComparisonTableProps {
  rows: { cabana: Cabana; summary: RangeSummary }[];
}

export default function CabanaComparisonTable({ rows }: CabanaComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-pine/20 text-left text-pine/60">
            <th className="py-2 pr-3 font-medium">Cabaña</th>
            <th className="py-2 pr-3 font-medium">Facturado</th>
            <th className="py-2 pr-3 font-medium">Cobrado</th>
            <th className="py-2 pr-3 font-medium">Pendiente</th>
            <th className="py-2 pr-3 font-medium">Reservas activas</th>
            <th className="py-2 pr-3 font-medium">Ocupación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ cabana, summary }) => (
            <tr key={cabana.id} className="border-b border-pine/10">
              <td className="py-2 pr-3 font-medium text-pine">{cabana.nombre}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-pine">
                {formatMoney(summary.totalFacturado)}
              </td>
              <td className="whitespace-nowrap py-2 pr-3 text-pine">
                {formatMoney(summary.totalCobrado)}
              </td>
              <td
                className={`whitespace-nowrap py-2 pr-3 ${
                  summary.totalPendiente > 0 ? "font-medium text-estado-pendiente" : "text-pine"
                }`}
              >
                {formatMoney(summary.totalPendiente)}
              </td>
              <td className="py-2 pr-3 text-pine">{summary.reservasActivas}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-pine">
                {summary.ocupacionPct.toFixed(0)}%{" "}
                <span className="text-pine/50">
                  ({summary.nochesReservadas}/{summary.nochesDisponibles})
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
