import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReservaInput } from "@/types/reserva";

function friendlyError(code: string | undefined, message: string): string {
  if (code === "23P01") {
    return "Las fechas se superponen con otra reserva existente para esta cabaña.";
  }
  if (code === "23514") {
    return "La fecha de check-out debe ser posterior a la de check-in.";
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

  const body = (await request.json()) as ReservaInput;

  const { data, error } = await supabase
    .from("reservas")
    .update({
      check_in: body.check_in,
      check_out: body.check_out,
      huesped_nombre: body.huesped_nombre,
      personas: body.personas,
      total: body.total,
      sena: body.sena,
      estado_pago: body.estado_pago,
      notas: body.notas || null,
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

  const { error } = await supabase.from("reservas").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: friendlyError(error.code, error.message) }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
