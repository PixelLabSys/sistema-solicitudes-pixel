"use client";

import { useState, useTransition } from "react";
import type {
  Colaborador,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
} from "@/lib/types";
import { aprobarSolicitud, rechazarSolicitud } from "./actions";

function fmtCOP(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function Detalle({
  solicitud,
  permiso,
  vacaciones,
  nomina,
}: {
  solicitud: Solicitud;
  permiso?: SolicitudPermisoDetalle;
  vacaciones?: SolicitudVacacionesDetalle;
  nomina?: SolicitudNominaDetalle;
}) {
  if (solicitud.tipo === "permiso" && permiso) {
    return (
      <>
        Permiso {permiso.tipo_permiso} · {permiso.fecha_desde}
        {permiso.fecha_desde !== permiso.fecha_hasta ? ` a ${permiso.fecha_hasta}` : ""}
        {" · "}
        {permiso.hora_desde}–{permiso.hora_hasta}
      </>
    );
  }
  if (solicitud.tipo === "vacaciones" && vacaciones) {
    return (
      <>
        Vacaciones {vacaciones.tipo_vacaciones} · {vacaciones.fecha_desde} a{" "}
        {vacaciones.fecha_hasta}
        {vacaciones.advertencia_45_dias && (
          <span className="badge badge-yellow" style={{ marginLeft: 6 }}>
            menos de 45 días
          </span>
        )}
      </>
    );
  }
  if (solicitud.tipo === "nomina" && nomina) {
    return (
      <>
        Adelanto de {nomina.tipo_adelanto} · {fmtCOP(nomina.valor_neto)}
        {nomina.transferencia_bancaria ? " · requiere transferencia" : ""}
      </>
    );
  }
  return null;
}

export function AprobacionRow({
  solicitud,
  colaborador,
  permiso,
  vacaciones,
  nomina,
  urlSoporte,
}: {
  solicitud: Solicitud;
  colaborador: Colaborador;
  permiso?: SolicitudPermisoDetalle;
  vacaciones?: SolicitudVacacionesDetalle;
  nomina?: SolicitudNominaDetalle;
  urlSoporte?: string;
}) {
  const [mostrarRechazo, setMostrarRechazo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAprobar() {
    setError(null);
    startTransition(async () => {
      const res = await aprobarSolicitud(solicitud.id);
      if (res?.error) setError(res.error);
    });
  }

  function handleRechazar() {
    setError(null);
    startTransition(async () => {
      const res = await rechazarSolicitud(solicitud.id, motivo);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontWeight: 500 }}>
            {solicitud.consecutivo} · {colaborador?.nombre_completo}
          </p>
          <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
            <Detalle solicitud={solicitud} permiso={permiso} vacaciones={vacaciones} nomina={nomina} />
          </p>
          {solicitud.tipo === "permiso" && permiso?.descripcion && (
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
              {permiso.descripcion}
            </p>
          )}
          {solicitud.tipo === "vacaciones" && vacaciones?.observaciones && (
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
              {vacaciones.observaciones}
            </p>
          )}
          {error && !mostrarRechazo && (
            <div className="form-error" style={{ marginTop: 8 }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <a
            href={`/aprobaciones/vista-previa/${solicitud.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            title="Ver solicitud completa (PDF)"
          >
            👁 Ver solicitud
          </a>
          {urlSoporte && (
            <a
              href={urlSoporte}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              title="Ver soporte adjunto"
            >
              👁 Ver soporte
            </a>
          )}
          <button className="btn btn-success btn-sm" disabled={pending} onClick={handleAprobar}>
            Aprobar
          </button>
          <button
            className="btn btn-danger btn-sm"
            disabled={pending}
            onClick={() => setMostrarRechazo((v) => !v)}
          >
            Rechazar
          </button>
        </div>
      </div>

      {mostrarRechazo && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          {error && <div className="form-error" style={{ marginBottom: 8 }}>{error}</div>}
          <label className="form-label">Motivo de rechazo (obligatorio)</label>
          <textarea
            className="form-textarea"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            style={{ marginTop: 5, marginBottom: 10 }}
          />
          <button className="btn btn-danger btn-sm" disabled={pending} onClick={handleRechazar}>
            {pending ? "Enviando..." : "Confirmar rechazo"}
          </button>
        </div>
      )}
    </div>
  );
}
