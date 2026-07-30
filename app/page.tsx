import { createClient } from "@/lib/supabase/server";
import { clampMonth, getFetchRange, getMonthGrid, todayISO } from "@/lib/dates";
import type { Cabana, EstadoPago, Reserva } from "@/types/reserva";
import CabanaTabs from "@/components/calendar/CabanaTabs";
import MonthNav from "@/components/calendar/MonthNav";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import ViewToggle from "@/components/calendar/ViewToggle";
import SummaryCards from "@/components/calendar/SummaryCards";
import NuevaReservaButton from "@/components/calendar/NuevaReservaButton";
import RememberCabana from "@/components/calendar/RememberCabana";
import ListFilters from "@/components/list/ListFilters";
import ReservaListView from "@/components/list/ReservaListView";
import { computeMonthSummary } from "@/lib/summary";

const ESTADO_VALUES: EstadoPago[] = ["pendiente", "sena", "pagado"];

interface HomeProps {
  searchParams: {
    cabana?: string;
    year?: string;
    month?: string;
    view?: string;
    desde?: string;
    hasta?: string;
    estado?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = createClient();

  const { data: cabanasData } = await supabase
    .from("cabanas")
    .select("id, nombre")
    .order("nombre");
  const cabanas: Cabana[] = cabanasData ?? [];

  const selectedCabanaId =
    (searchParams.cabana && cabanas.some((c) => c.id === searchParams.cabana)
      ? searchParams.cabana
      : cabanas[0]?.id) ?? "";

  const view = searchParams.view === "list" ? "list" : "calendar";

  if (view === "list") {
    const desde = searchParams.desde ?? "";
    const hasta = searchParams.hasta ?? "";
    const estado = searchParams.estado ?? "todos";

    let reservas: Reserva[] = [];
    if (selectedCabanaId) {
      let query = supabase
        .from("reservas")
        .select("*")
        .eq("cabana_id", selectedCabanaId)
        .order("check_in");

      if (desde) query = query.gte("check_out", desde);
      if (hasta) query = query.lte("check_in", hasta);
      if (ESTADO_VALUES.includes(estado as EstadoPago)) {
        query = query.eq("estado_pago", estado as EstadoPago);
      }

      const { data } = await query;
      reservas = data ?? [];
    }

    return (
      <div className="mx-auto max-w-6xl px-3 py-6 pb-28 sm:px-6">
        <RememberCabana cabanaId={selectedCabanaId} />
        <CabanaTabs cabanas={cabanas} selectedCabanaId={selectedCabanaId} />
        <ViewToggle view={view} />
        <ListFilters desde={desde} hasta={hasta} estado={estado} />
        <ReservaListView cabanaId={selectedCabanaId} reservas={reservas} />
        <NuevaReservaButton cabanaId={selectedCabanaId} defaultDateISO={todayISO()} />
      </div>
    );
  }

  const now = new Date();
  const year = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear();
  const month = clampMonth(
    searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth() + 1,
  );
  const safeYear = Number.isNaN(year) ? now.getFullYear() : year;

  const grid = getMonthGrid(safeYear, month);
  const { startISO, endISO } = getFetchRange(grid);

  let reservas: Reserva[] = [];
  if (selectedCabanaId) {
    const { data } = await supabase
      .from("reservas")
      .select("*")
      .eq("cabana_id", selectedCabanaId)
      .lt("check_in", endISO)
      .gt("check_out", startISO)
      .order("check_in");
    reservas = data ?? [];
  }

  const summary = computeMonthSummary(reservas, safeYear, month);
  const monthFirstDayISO = grid.find((cell) => cell.isCurrentMonth)?.iso ?? todayISO();

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 pb-28 sm:px-6">
      <RememberCabana cabanaId={selectedCabanaId} />
      <CabanaTabs cabanas={cabanas} selectedCabanaId={selectedCabanaId} />
      <ViewToggle view={view} />
      <MonthNav year={safeYear} month={month} />
      <SummaryCards summary={summary} />
      <CalendarGrid
        year={safeYear}
        month={month}
        cabanaId={selectedCabanaId}
        reservas={reservas}
        todayISO={todayISO()}
      />
      <NuevaReservaButton cabanaId={selectedCabanaId} defaultDateISO={monthFirstDayISO} />
    </div>
  );
}
