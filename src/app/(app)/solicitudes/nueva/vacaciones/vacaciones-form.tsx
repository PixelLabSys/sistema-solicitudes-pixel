"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { Colaborador, SolicitudVacacionesDetalle } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { crearArea, crearCargo } from "@/lib/data/catalogos-actions";
import { SelectConCrear } from "@/components/select-con-crear";
import { crearSolicitudVacaciones, actualizarSolicitudVacaciones } from "./actions";

export function VacacionesForm({
  lideres,
  areas,
  cargos,
  colaborador,
  edicion,
}: {
  lideres: Colaborador[];
  areas: string[];
  cargos: string[];
  colaborador: Colaborador;
  edicion?: {
    solicitudId: string;
    liderActualId: string;
    firmaExistente: string;
    detalle: SolicitudVacacionesDetalle;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState(edicion?.detalle.fecha_desde ?? "");
  const [tipoVacaciones, setTipoVacaciones] = useState(edicion?.detalle.tipo_vacaciones ?? "");
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
        ? await actualizarSolicitudVacaciones(edicion.solicitudId, formData)
        : await crearSolicitudVacaciones(formData);
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
          <SelectConCrear
            name="area"
            opciones={areas}
            valorInicial={d?.area}
            crearNuevo={crearArea}
            placeholder="Selecciona un área..."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Cargo actual</label>
          <SelectConCrear
            name="cargo_actual"
            opciones={cargos}
            valorInicial={d?.cargo_actual}
            crearNuevo={crearCargo}
            placeholder="Selecciona un cargo..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de vacaciones</label>
          <select
            name="tipo_vacaciones"
            className="form-select"
            required
            value={tipoVacaciones}
            onChange={(e) => setTipoVacaciones(e.target.value as typeof tipoVacaciones)}
          >
            <option value="" disabled>
              Selecciona...
            </option>
            <option value="compensadas">Vacaciones compensadas</option>
            <option value="disfrutadas">Vacaciones disfrutadas</option>
            <option value="mixtas">Vacaciones mixtas</option>
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

        {tipoVacaciones === "mixtas" && (
          <div className="form-group">
            <label className="form-label">Días a compensar</label>
            <select name="dias_compensados" className="form-select" required defaultValue={d?.dias_compensados ?? ""}>
              <option value="" disabled>
                Selecciona...
              </option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "día" : "días"}
                </option>
              ))}
            </select>
            <p className="form-hint">El resto del periodo se entiende como disfrutado.</p>
          </div>
        )}

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
          <input name="fecha_hasta" type="date" className="form-input" required defaultValue={d?.fecha_hasta} />
        </div>

        <div className="form-group">
          <label className="form-label">Ingreso a laborar</label>
          <input
            name="ingreso_a_laborar"
            type="date"
            className="form-input"
            required
            defaultValue={d?.ingreso_a_laborar}
          />
        </div>

        <div className="form-group form-full">
          <label className="form-label">Observaciones</label>
          <textarea name="observaciones" className="form-textarea" defaultValue={d?.observaciones ?? ""} />
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
