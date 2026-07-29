"use client";

import { useState } from "react";
import ReservaModal from "@/components/calendar/ReservaModal";

interface NuevaReservaButtonProps {
  cabanaId: string;
  defaultDateISO: string;
}

export default function NuevaReservaButton({ cabanaId, defaultDateISO }: NuevaReservaButtonProps) {
  const [open, setOpen] = useState(false);

  if (!cabanaId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary fixed bottom-5 right-4 z-40 rounded-full px-5 shadow-lg sm:bottom-6 sm:right-6"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        Nueva reserva
      </button>

      {open && (
        <ReservaModal
          cabanaId={cabanaId}
          dateISO={defaultDateISO}
          reservas={[]}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
