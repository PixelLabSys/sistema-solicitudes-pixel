"use client";

import { useRef, useState, useTransition } from "react";
import type { Colaborador, SolicitudPermisoDetalle } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { crearSolicitudPermiso, actualizarSolicitudPermiso } from "./actions";

export function PermisoForm({
  lideres,
  colaborador,
  edicion,
}: {
  lideres: Colaborador[];
  colaborador: Colaborador;
  edicion?: {
    solicitudId: string;
    liderActualId: string;
    firmaExistente: string;
    detalle: SolicitudPermisoDetalle;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const firmaInputRef = useRef<HTMLInputElement>(null);

  async function subirFirma(): Promise<string | null> {
    const archivo = firmaInputRef.current?.files?.[0];
    if (!archivo || archivo.size === 0) {
      if (edicion) return edicion.firmaExistente;
      setError("La firma es obligatoria.");
      return null;
    }
    if (!["image/jpeg", "image/jpg"].includes(archivo.type)) {
      setError("La firma debe ser un archivo JPG/JPEG.");
      return null;
    }
    if (archivo.size > 2 * 1024 * 1024) {
      setError("La firma no puede pesar más de 2MB.");
      return null;
    }

    const supabase = createClient();
    const ruta = `${crypto.randomUUID()}.jpg`;
    const { error: errorUpload } = await supabase.storage
      .from("firmas")
      .upload(ruta, archivo, { contentType: "image/jpeg" });

    if (errorUpload) {
      setError("No se pudo subir la firma: " + errorUpload.message);
      return null;
    }
    return ruta;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const rutaFirma = await subirFirma();
      if (!rutaFirma) return;

      formData.set("firma_path", rutaFirma);
      const res = edicion
        ? await actualizarSolicitudPermiso(edicion.solicitudId, formData)
        : await crearSolicitudPermiso(formData);
      if (res?.error) setError(res.error);
    });
  }

  if (lideres.length === 0) {
    return (
      <div className="alert alert-error">
        No hay líderes de área configurados todavía. Contacta a Talento Humano
        antes de radicar una solicitud.
      </div>
    );
  }

  const d = edicion?.detalle;

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input className="form-input" value={colaborador.nombre_completo} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">CC</label>
          <input className="form-input" value={colaborador.cc} disabled />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha desde</label>
          <input name="fecha_desde" type="date" className="form-input" required defaultValue={d?.fecha_desde} />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha hasta</label>
          <input name="fecha_hasta" type="date" className="form-input" required defaultValue={d?.fecha_hasta} />
        </div>

        <div className="form-group">
          <label className="form-label">Hora desde</label>
          <input name="hora_desde" type="time" className="form-input" required defaultValue={d?.hora_desde} />
        </div>
        <div className="form-group">
          <label className="form-label">Hora hasta</label>
          <input name="hora_hasta" type="time" className="form-input" required defaultValue={d?.hora_hasta} />
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de permiso</label>
          <select name="tipo_permiso" className="form-select" required defaultValue={d?.tipo_permiso ?? ""}>
            <option value="" disabled>
              Selecciona...
            </option>
            <option value="medico">Médico</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Líder de proceso</label>
          <select
            name="lider_aprobador_id"
            className="form-select"
            required
            defaultValue={edicion?.liderActualId ?? ""}
          >
            <option value="" disabled>
              Selecciona un líder de área...
            </option>
            {lideres.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-full">
          <label className="form-label">Descripción / observaciones</label>
          <textarea name="descripcion" className="form-textarea" defaultValue={d?.descripcion ?? ""} />
        </div>

        <div className="form-group form-full">
          <label className="form-label">
            Firma (JPG/JPEG){edicion ? " — deja vacío para conservar la actual" : " — obligatoria"}
          </label>
          <input
            ref={firmaInputRef}
            type="file"
            accept="image/jpeg"
            className="form-input"
            required={!edicion}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando..." : edicion ? "Guardar cambios" : "Enviar solicitud"}
      </button>
    </form>
  );
}
