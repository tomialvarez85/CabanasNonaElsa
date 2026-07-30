"use client";

import { useEffect } from "react";
import { LAST_CABANA_STORAGE_KEY } from "@/lib/lastCabana";

/**
 * Guarda en localStorage la última cabaña que el usuario estaba viendo en el
 * calendario/lista principal, para que "Resumen general" pueda volver a ella
 * (ver components/resumen/VolverAlCalendarioButton.tsx). No renderiza nada.
 */
export default function RememberCabana({ cabanaId }: { cabanaId: string }) {
  useEffect(() => {
    if (!cabanaId) return;
    window.localStorage.setItem(LAST_CABANA_STORAGE_KEY, cabanaId);
  }, [cabanaId]);

  return null;
}
