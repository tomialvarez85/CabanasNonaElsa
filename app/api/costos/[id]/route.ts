import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CostoInput } from "@/types/costo";

function friendlyError(code: string | undefined, message: string): string {
  if (code === "23514") {
    if (message.includes("costos_fecha_fin_posterior")) {
      return "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }
    if (message.includes("costos_frecuencia_coherente")) {
      return "Un gasto recurrente necesita una frecuencia (mensual o anual).";
    }
    return "Revisá los datos cargados: hay un valor inválido.";
  }
  return message;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json()) as CostoInput;

  const { data, error } = await supabase
    .from("costos")
    .update({
      cabana_id: body.cabana_id,
      categoria: body.categoria,
      descripcion: body.descripcion,
      monto: body.monto,
      es_recurrente: body.es_recurrente,
      frecuencia: body.frecuencia,
      fecha: body.fecha,
      fecha_fin: body.fecha_fin,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: friendlyError(error.code, error.message) }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { error } = await supabase.from("costos").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: friendlyError(error.code, error.message) }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
