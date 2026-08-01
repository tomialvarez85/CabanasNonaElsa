export async function deleteCosto(id: string): Promise<string | null> {
  const res = await fetch(`/api/costos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return body.error || "No se pudo eliminar el costo.";
  }
  return null;
}
