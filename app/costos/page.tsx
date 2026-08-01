import { createClient } from "@/lib/supabase/server";
import type { Cabana } from "@/types/reserva";
import type { Costo } from "@/types/costo";
import BackButton from "@/components/ui/BackButton";
import CostoList from "@/components/costos/CostoList";
import NuevoCostoButton from "@/components/costos/NuevoCostoButton";

export default async function CostosPage() {
  const supabase = createClient();

  const { data: cabanasData } = await supabase
    .from("cabanas")
    .select("id, nombre")
    .order("nombre");
  const cabanas: Cabana[] = cabanasData ?? [];
  const cabanaNombreById = new Map(cabanas.map((cabana) => [cabana.id, cabana.nombre]));

  const { data: costosData } = await supabase
    .from("costos")
    .select("*")
    .order("fecha", { ascending: false });
  const costos: Costo[] = costosData ?? [];

  const recurrentes = costos.filter((c) => c.es_recurrente);
  const puntuales = costos.filter((c) => !c.es_recurrente);

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackButton href="/" />
          <h2 className="text-xl font-semibold text-cream">Costos</h2>
        </div>
        <NuevoCostoButton cabanas={cabanas} />
      </div>

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-cream/60">
          Gastos fijos recurrentes
        </h3>
        <CostoList
          costos={recurrentes}
          cabanas={cabanas}
          cabanaNombreById={cabanaNombreById}
          variant="recurrente"
          emptyMessage="No hay gastos recurrentes cargados todavía."
        />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-cream/60">
          Gastos puntuales
        </h3>
        <CostoList
          costos={puntuales}
          cabanas={cabanas}
          cabanaNombreById={cabanaNombreById}
          variant="puntual"
          emptyMessage="No hay gastos puntuales cargados todavía."
        />
      </section>
    </div>
  );
}
