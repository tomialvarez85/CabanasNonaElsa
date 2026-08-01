"use client";

import { useState } from "react";
import CostoModal from "@/components/costos/CostoModal";
import type { Cabana } from "@/types/reserva";

interface NuevoCostoButtonProps {
  cabanas: Cabana[];
}

export default function NuevoCostoButton({ cabanas }: NuevoCostoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary shrink-0">
        <span aria-hidden="true">+</span> Nuevo costo
      </button>
      {open && <CostoModal cabanas={cabanas} onClose={() => setOpen(false)} />}
    </>
  );
}
