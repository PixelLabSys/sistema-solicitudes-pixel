"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { Colaborador } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { crearSolicitudVacaciones } from "./actions";

export function VacacionesForm({
  lideres,
  colaborador,
}: {
  lideres: Colaborador[];
  colaborador: Colaborador;
}) {
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [pending, startTransition] = useTransition();
  const firmaInputRef = useRef<HTMLInputElement>(null);

  const mostrarAdvertencia45 = useMemo(() => {
    if (!fechaDesde) return false;
    const dias = (new Date(fechaDesde).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return dias < 45;
  }, [fechaDesde]);

  async function subirFirma(): Promise<string | null> {
    const archivo = firmaInputRef.current?.files?.[0];
    if (!archivo || archivo.size === 0) {
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
      const res = await crearSolicitudVacaciones(formData);
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

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}
      {mostrarAdvertencia45 && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          Estás radicando con menos de 45 días de anticipación. Puedes
          continuar; la decisión final la toman tu líder y Talento Humano.
        </div>
      )}

      <div className="form-grid" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Nombre y apellido</label>
          <input className="form-input" value={colaborador.nombre_completo} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">CC</label>
          <input className="form-input" value={colaborador.cc} disabled />
        </div>

        <div className="form-group">
          <label className="form-label">Área</label>
          <input name="area" className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Cargo actual</label>
          <input name="cargo_actual" className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de vacaciones</label>
          <select name="tipo_vacaciones" className="form-select" required defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            <option value="compensadas">Vacaciones compensadas</option>
            <option value="disfrutadas">Vacaciones disfrutadas</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Líder de proceso</label>
          <select name="lider_aprobador_id" className="form-select" required defaultValue="">
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

        <div className="form-group">
          <label className="form-label">Fecha de descanso — desde</label>
          <input
            name="fecha_desde"
            type="date"
            className="form-input"
            required
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de descanso — hasta</label>
          <input name="fecha_hasta" type="date" className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">Ingreso a laborar</label>
          <input name="ingreso_a_laborar" type="date" className="form-input" required />
        </div>

        <div className="form-group form-full">
          <label className="form-label">Observaciones</label>
          <textarea name="observaciones" className="form-textarea" />
        </div>

        <div className="form-group form-full">
          <label className="form-label">Firma (JPG/JPEG) — obligatoria</label>
          <input ref={firmaInputRef} type="file" accept="image/jpeg" className="form-input" required />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
