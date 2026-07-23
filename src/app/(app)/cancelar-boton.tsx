"use client";

import { useTransition } from "react";
import { cancelarSolicitud } from "./actions";

export function CancelarBoton({ solicitudId }: { solicitudId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Cancelar esta solicitud?")) return;
    startTransition(async () => {
      await cancelarSolicitud(solicitudId);
    });
  }

  return (
    <button className="btn btn-ghost btn-sm" disabled={pending} onClick={handleClick}>
      {pending ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
