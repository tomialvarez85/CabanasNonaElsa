"use client";

import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import ReservaForm from "@/components/calendar/ReservaForm";
import type { Reserva } from "@/types/reserva";

interface ReservaEditModalProps {
  reserva: Reserva;
  onClose: () => void;
}

export default function ReservaEditModal({ reserva, onClose }: ReservaEditModalProps) {
  const router = useRouter();

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold text-pine">Editar reserva</h2>
      <ReservaForm
        cabanaId={reserva.cabana_id}
        initial={reserva}
        reservaId={reserva.id}
        onDone={() => {
          router.refresh();
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
