export async function deleteReserva(id: string): Promise<string | null> {
  const res = await fetch(`/api/reservas/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return body.error || "No se pudo eliminar la reserva.";
  }
  return null;
}
