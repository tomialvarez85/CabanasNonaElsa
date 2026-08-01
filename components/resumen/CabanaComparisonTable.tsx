import { formatMoney } from "@/lib/format";
import type { RangeSummary } from "@/lib/summary";
import type { Cabana } from "@/types/reserva";

interface CabanaComparisonTableProps {
  rows: { cabana: Cabana; summary: RangeSummary; costos: number }[];
}

export default function CabanaComparisonTable({ rows }: CabanaComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-cream/20 text-left text-cream/60">
            <th className="py-2 pr-3 font-medium">Cabaña</th>
            <th className="py-2 pr-3 font-medium">Facturado</th>
            <th className="py-2 pr-3 font-medium">Cobrado</th>
            <th className="py-2 pr-3 font-medium">Pendiente</th>
            <th className="py-2 pr-3 font-medium">Costos específicos</th>
            <th className="py-2 pr-3 font-medium">Reservas activas</th>
            <th className="py-2 pr-3 font-medium">Ocupación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ cabana, summary, costos }) => (
            <tr key={cabana.id} className="border-b border-cream/10">
              <td className="py-2 pr-3 font-medium text-cream">{cabana.nombre}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-cream">
                {formatMoney(summary.totalFacturado)}
              </td>
              <td className="whitespace-nowrap py-2 pr-3 text-cream">
                {formatMoney(summary.totalCobrado)}
              </td>
              <td
                className={`whitespace-nowrap py-2 pr-3 ${
                  summary.totalPendiente > 0 ? "font-medium text-estado-pendiente" : "text-cream"
                }`}
              >
                {formatMoney(summary.totalPendiente)}
              </td>
              <td className="whitespace-nowrap py-2 pr-3 text-cream">{formatMoney(costos)}</td>
              <td className="py-2 pr-3 text-cream">{summary.reservasActivas}</td>
              <td className="whitespace-nowrap py-2 pr-3 text-cream">
                {summary.ocupacionPct.toFixed(0)}%{" "}
                <span className="text-cream/50">
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
