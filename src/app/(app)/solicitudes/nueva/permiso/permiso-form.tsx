"use client";

import { useRef, useState, useTransition } from "react";
import type { Colaborador, SolicitudPermisoDetalle } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { SelectConCrear } from "@/components/select-con-crear";
import { crearArea, crearCargo } from "@/lib/data/catalogos-actions";
import { crearSolicitudPermiso, actualizarSolicitudPermiso } from "./actions";

export function PermisoForm({
  lideres,
  colaborador,
  areas,
  cargos,
  edicion,
}: {
  lideres: Colaborador[];
  colaborador: Colaborador;
  areas: string[];
  cargos: string[];
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
  const soporteInputRef = useRef<HTMLInputElement>(null);

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

  async function subirSoporte(): Promise<{ ok: true; ruta: string | null } | { ok: false }> {
    const archivo = soporteInputRef.current?.files?.[0];
    if (!archivo || archivo.size === 0) {
      return { ok: true, ruta: null };
    }
    const tiposValidos = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!tiposValidos.includes(archivo.type)) {
      setError("El soporte debe ser un PDF, JPG o PNG.");
      return { ok: false };
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError("El soporte no puede pesar más de 5MB.");
      return { ok: false };
    }

    const extension = archivo.type === "application/pdf" ? "pdf" : archivo.type === "image/png" ? "png" : "jpg";
    const supabase = createClient();
    const ruta = `${crypto.randomUUID()}.${extension}`;
    const { error: errorUpload } = await supabase.storage
      .from("soportes")
      .upload(ruta, archivo, { contentType: archivo.type });

    if (errorUpload) {
      setError("No se pudo subir el soporte: " + errorUpload.message);
      return { ok: false };
    }
    return { ok: true, ruta };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const rutaFirma = await subirFirma();
      if (!rutaFirma) return;

      const resSoporte = await subirSoporte();
      if (!resSoporte.ok) return;
      if (resSoporte.ruta) formData.set("soporte_path", resSoporte.ruta);

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
          <label className="form-label">Área</label>
          <SelectConCrear
            name="area"
            opciones={areas}
            valorInicial={d?.area ?? undefined}
            crearNuevo={crearArea}
            placeholder="Selecciona un área..."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Cargo actual</label>
          <SelectConCrear
            name="cargo_actual"
            opciones={cargos}
            valorInicial={d?.cargo_actual ?? undefined}
            crearNuevo={crearCargo}
            placeholder="Selecciona un cargo..."
          />
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
            <option value="escolar">Escolar</option>
            <option value="judicial">Judicial</option>
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

        <div className="form-group form-full">
          <label className="form-label">
            Soporte (PDF/JPG/PNG) — opcional{edicion?.detalle.soporte_url ? ", deja vacío para conservar el actual" : ""}
          </label>
          <input ref={soporteInputRef} type="file" accept="application/pdf,image/jpeg,image/png" className="form-input" />
          <p className="form-hint">Ej. soporte de cita médica, cita en colegio, etc.</p>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando..." : edicion ? "Guardar cambios" : "Enviar solicitud"}
      </button>
    </form>
  );
}
