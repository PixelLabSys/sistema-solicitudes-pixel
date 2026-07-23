import type { EstadoSolicitud } from "@/lib/types";

const ESTILOS: Record<EstadoSolicitud, string> = {
  pendiente: "badge-yellow",
  aprobada: "badge-green",
  rechazada: "badge-red",
  cancelada: "badge-gray",
};

const ETIQUETAS: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

export function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  return <span className={`badge ${ESTILOS[estado]}`}>{ETIQUETAS[estado]}</span>;
}
