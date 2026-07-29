import { createClient } from "@/lib/supabase/server";
import { addDays, fromISO, toISO } from "@/lib/dates";
import {
  combineRangeSummaries,
  computeMonthlyRevenueByCabana,
  computeRangeSummary,
} from "@/lib/summary";
import type { Cabana, ReservaConCabana } from "@/types/reserva";
import RangeSelector from "@/components/resumen/RangeSelector";
import SummaryCards from "@/components/calendar/SummaryCards";
import CabanaComparisonTable from "@/components/resumen/CabanaComparisonTable";
import MonthlyRevenueChart from "@/components/resumen/MonthlyRevenueChart";

interface ResumenGeneralProps {
  searchParams: { preset?: string; desde?: string; hasta?: string };
}

function currentMonthRange(): { startISO: string; endExclusiveISO: string } {
  const now = new Date();
  return {
    startISO: toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))),
    endExclusiveISO: toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1))),
  };
}

export default async function ResumenGeneralPage({ searchParams }: ResumenGeneralProps) {
  const supabase = createClient();

  const { data: cabanasData } = await supabase
    .from("cabanas")
    .select("id, nombre")
    .order("nombre");
  const cabanas: Cabana[] = cabanasData ?? [];

  const preset =
    searchParams.preset === "custom" || searchParams.preset === "temporada"
      ? searchParams.preset
      : "mes_actual";

  let rangeStartISO: string;
  let rangeEndExclusiveISO: string;
  let reservas: ReservaConCabana[];

  if (preset === "temporada") {
    const { data } = await supabase
      .from("reservas")
      .select("*, cabana:cabanas(id, nombre)")
      .order("check_in");
    reservas = (data ?? []) as ReservaConCabana[];

    if (reservas.length > 0) {
      rangeStartISO = reservas.reduce((min, r) => (r.check_in < min ? r.check_in : min), reservas[0].check_in);
      rangeEndExclusiveISO = reservas.reduce(
        (max, r) => (r.check_out > max ? r.check_out : max),
        reservas[0].check_out,
      );
    } else {
      const fallback = currentMonthRange();
      rangeStartISO = fallback.startISO;
      rangeEndExclusiveISO = fallback.endExclusiveISO;
    }
  } else {
    if (preset === "custom" && searchParams.desde && searchParams.hasta) {
      rangeStartISO = searchParams.desde;
      rangeEndExclusiveISO = toISO(addDays(fromISO(searchParams.hasta), 1));
    } else {
      const current = currentMonthRange();
      rangeStartISO = current.startISO;
      rangeEndExclusiveISO = current.endExclusiveISO;
    }

    const { data } = await supabase
      .from("reservas")
      .select("*, cabana:cabanas(id, nombre)")
      .lt("check_in", rangeEndExclusiveISO)
      .gt("check_out", rangeStartISO)
      .order("check_in");
    reservas = (data ?? []) as ReservaConCabana[];
  }

  const perCabana = cabanas.map((cabana) => {
    const cabanaReservas = reservas.filter((r) => r.cabana_id === cabana.id);
    return {
      cabana,
      summary: computeRangeSummary(cabanaReservas, rangeStartISO, rangeEndExclusiveISO),
    };
  });

  const combinedSummary = combineRangeSummaries(perCabana.map((p) => p.summary));

  const cabanaNombres = cabanas.map((c) => c.nombre);
  const monthlyRevenue = computeMonthlyRevenueByCabana(
    reservas.map((r) => ({
      check_in: r.check_in,
      total: r.total,
      cabanaNombre: r.cabana?.nombre ?? "Sin cabaña",
    })),
    cabanaNombres,
  );

  const hastaInclusiveISO = toISO(addDays(fromISO(rangeEndExclusiveISO), -1));

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6">
      <h2 className="mb-4 text-xl font-semibold text-pine">Resumen general</h2>

      <RangeSelector
        preset={preset}
        desde={searchParams.desde ?? rangeStartISO}
        hasta={searchParams.hasta ?? hastaInclusiveISO}
      />

      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-pine/60">
        Totales combinados (ambas cabañas)
      </h3>
      <SummaryCards summary={combinedSummary} />

      <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-pine/60">
        Comparativa por cabaña
      </h3>
      <div className="mb-6">
        <CabanaComparisonTable rows={perCabana} />
      </div>

      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-pine/60">
        Facturación mensual por cabaña
      </h3>
      <MonthlyRevenueChart data={monthlyRevenue} cabanaNombres={cabanaNombres} />
    </div>
  );
}
