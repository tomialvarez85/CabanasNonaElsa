"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import CostoForm from "@/components/costos/CostoForm";
import { todayISO } from "@/lib/dates";
import type { Cabana } from "@/types/reserva";
import type { Costo } from "@/types/costo";

interface CostoModalProps {
  cabanas: Cabana[];
  costo?: Costo | null;
  onClose: () => void;
}

export default function CostoModal({ cabanas, costo, onClose }: CostoModalProps) {
  const router = useRouter();

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold text-cream">
        {costo ? "Editar costo" : "Nuevo costo"}
      </h2>
      <CostoForm
        cabanas={cabanas}
        initial={costo ?? { fecha: todayISO() }}
        costoId={costo?.id}
        onDone={() => {
          router.refresh();
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
