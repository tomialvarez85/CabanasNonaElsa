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
import CostosSummaryCards from "@/components/resumen/CostosSummaryCards";
import CabanaComparisonTable from "@/components/resumen/CabanaComparisonTable";
import MonthlyRevenueChart from "@/components/resumen/MonthlyRevenueChart";
import VolverAlCalendarioButton from "@/components/resumen/VolverAlCalendarioButton";

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

  const hastaInclusiveISO = toISO(addDays(fromISO(rangeEndExclusiveISO), -1));

  // Costos del rango, vía la función calcular_costos_rango (supabase/schema.sql):
  // una llamada para los compartidos (cabana_id = null en la función siempre
  // trae solo los compartidos, sin importar p_incluir_compartidos) y una por
  // cabaña pidiendo *solo* sus costos específicos (p_incluir_compartidos =
  // false), para no contar los compartidos más de una vez al sumarlos todos.
  const [costosCompartidosResult, ...costosPorCabanaResults] = await Promise.all([
    supabase.rpc("calcular_costos_rango", {
      p_desde: rangeStartISO,
      p_hasta: hastaInclusiveISO,
      p_cabana_id: null,
      p_incluir_compartidos: true,
    }),
    ...cabanas.map((cabana) =>
      supabase.rpc("calcular_costos_rango", {
        p_desde: rangeStartISO,
        p_hasta: hastaInclusiveISO,
        p_cabana_id: cabana.id,
        p_incluir_compartidos: false,
      }),
    ),
  ]);

  const costosCompartidos = Number(costosCompartidosResult.data ?? 0);
  const costosPorCabana = cabanas.map((cabana, index) => ({
    cabana,
    costos: Number(costosPorCabanaResults[index]?.data ?? 0),
  }));

  const perCabana = cabanas.map((cabana) => {
    const cabanaReservas = reservas.filter((r) => r.cabana_id === cabana.id);
    return {
      cabana,
      summary: computeRangeSummary(cabanaReservas, rangeStartISO, rangeEndExclusiveISO),
      costos: costosPorCabana.find((c) => c.cabana.id === cabana.id)?.costos ?? 0,
    };
  });

  const combinedSummary = combineRangeSummaries(perCabana.map((p) => p.summary));

  // Costos totales = compartidos + la suma de los específicos de cada
  // cabaña (cada uno ya viene sin compartidos, así no se duplican).
  const costosTotales = costosCompartidos + perCabana.reduce((sum, p) => sum + p.costos, 0);
  const gananciaNeta = combinedSummary.totalFacturado - costosTotales;

  const cabanaNombres = cabanas.map((c) => c.nombre);
  const monthlyRevenue = computeMonthlyRevenueByCabana(
    reservas.map((r) => ({
      check_in: r.check_in,
      total: r.total,
      cabanaNombre: r.cabana?.nombre ?? "Sin cabaña",
    })),
    cabanaNombres,
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <VolverAlCalendarioButton />
        <h2 className="text-xl font-semibold text-cream">Resumen general</h2>
      </div>

      <RangeSelector
        preset={preset}
        desde={searchParams.desde ?? rangeStartISO}
        hasta={searchParams.hasta ?? hastaInclusiveISO}
      />

      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-cream/60">
        Totales combinados (ambas cabañas)
      </h3>
      <SummaryCards summary={combinedSummary} />
      <CostosSummaryCards costosTotales={costosTotales} gananciaNeta={gananciaNeta} />

      <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-cream/60">
        Comparativa por cabaña
      </h3>
      <p className="mb-2 text-xs text-cream/50">
        “Costos específicos” no incluye los gastos compartidos entre cabañas — esos solo
        se descuentan en la ganancia neta de arriba.
      </p>
      <div className="mb-6">
        <CabanaComparisonTable rows={perCabana} />
      </div>

      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-cream/60">
        Facturación mensual por cabaña
      </h3>
      <MonthlyRevenueChart data={monthlyRevenue} cabanaNombres={cabanaNombres} />
    </div>
  );
}
