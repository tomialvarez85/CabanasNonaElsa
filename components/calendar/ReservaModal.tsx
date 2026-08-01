"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import ReservaForm from "@/components/calendar/ReservaForm";
import { ESTADO_LABELS } from "@/lib/estado";
import { formatMoney } from "@/lib/format";
import { deleteReserva } from "@/lib/reservas-client";
import type { Reserva } from "@/types/reserva";

interface ReservaModalProps {
  cabanaId: string;
  dateISO: string;
  reservas: Reserva[];
  onClose: () => void;
}

export default function ReservaModal({ cabanaId, dateISO, reservas, onClose }: ReservaModalProps) {
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que querés eliminar esta reserva? No se puede deshacer.")) return;
    setDeletingId(id);
    setDeleteError(null);
    const err = await deleteReserva(id);
    setDeletingId(null);
    if (err) {
      setDeleteError(err);
      return;
    }
    router.refresh();
    onClose();
  }

  if (reservas.length === 0) {
    return (
      <Modal onClose={onClose}>
        <h2 className="mb-4 text-lg font-semibold text-cream">Nueva reserva</h2>
        <ReservaForm
          cabanaId={cabanaId}
          initial={{ check_in: dateISO, check_out: dateISO }}
          onDone={() => {
            router.refresh();
            onClose();
          }}
          onCancel={onClose}
        />
      </Modal>
    );
  }

  if (editingReserva) {
    return (
      <Modal onClose={onClose}>
        <h2 className="mb-4 text-lg font-semibold text-cream">Editar reserva</h2>
        <ReservaForm
          cabanaId={cabanaId}
          initial={editingReserva}
          reservaId={editingReserva.id}
          onDone={() => {
            router.refresh();
            onClose();
          }}
          onCancel={() => setEditingReserva(null)}
        />
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cream">Detalle de la reserva</h2>
        {reservas.length > 1 && (
          <span className="flex items-center gap-1 text-sm font-medium text-estado-pendiente">
            ⚠ {reservas.length} reservas superpuestas
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {reservas.map((reserva) => {
          const saldo = reserva.total - reserva.sena;
          return (
            <div key={reserva.id} className="card p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-cream">{reserva.huesped_nombre}</p>
                <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs font-medium text-cream">
                  {ESTADO_LABELS[reserva.estado_pago]}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-cream/90">
                <dt className="text-cream/60">Check-in</dt>
                <dd>{reserva.check_in}</dd>
                <dt className="text-cream/60">Check-out</dt>
                <dd>{reserva.check_out}</dd>
                <dt className="text-cream/60">Personas</dt>
                <dd>{reserva.personas}</dd>
                <dt className="text-cream/60">Total</dt>
                <dd>{formatMoney(reserva.total)}</dd>
                <dt className="text-cream/60">Seña</dt>
                <dd>{formatMoney(reserva.sena)}</dd>
                <dt className="text-cream/60">Saldo pendiente</dt>
                <dd className={saldo > 0 ? "font-medium text-estado-pendiente" : ""}>
                  {formatMoney(saldo)}
                </dd>
                {reserva.notas && (
                  <>
                    <dt className="text-cream/60">Notas</dt>
                    <dd>{reserva.notas}</dd>
                  </>
                )}
              </dl>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditingReserva(reserva)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(reserva.id)}
                  disabled={deletingId === reserva.id}
                  className="btn-danger flex-1 text-sm"
                >
                  {deletingId === reserva.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deleteError && <p className="mt-3 text-sm text-estado-pendiente">{deleteError}</p>}

      <button onClick={onClose} className="btn-primary mt-5">
        Cerrar
      </button>
    </Modal>
  );
}
