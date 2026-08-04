"use client";

import { useRef, useState, useTransition } from "react";
import type { Colaborador, SolicitudNominaDetalle } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { crearCargo } from "@/lib/data/catalogos-actions";
import { SelectConCrear } from "@/components/select-con-crear";
import { crearSolicitudNomina, actualizarSolicitudNomina } from "./actions";

export function NominaForm({
  lideres,
  cargos,
  colaborador,
  edicion,
}: {
  lideres: Colaborador[];
  cargos: string[];
  colaborador: Colaborador;
  edicion?: {
    solicitudId: string;
    liderActualId: string;
    firmaExistente: string;
    detalle: SolicitudNominaDetalle;
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
        ? await actualizarSolicitudNomina(edicion.solicitudId, formData)
        : await crearSolicitudNomina(formData);
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
          <label className="form-label">Cargo</label>
          <SelectConCrear
            name="cargo"
            opciones={cargos}
            valorInicial={d?.cargo}
            crearNuevo={crearCargo}
            placeholder="Selecciona un cargo..."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de adelanto</label>
          <select name="tipo_adelanto" className="form-select" required defaultValue={d?.tipo_adelanto ?? ""}>
            <option value="" disabled>
              Selecciona...
            </option>
            <option value="nomina">Adelanto de nómina</option>
            <option value="prima">Adelanto de prima</option>
            <option value="cuenta_cobro">Adelanto de cuenta de cobro</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Valor neto</label>
          <input
            name="valor_neto"
            type="number"
            min="1"
            step="1"
            className="form-input"
            required
            defaultValue={d?.valor_neto}
          />
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

        <div className="form-group form-full" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input
            name="transferencia_bancaria"
            type="checkbox"
            id="transferencia"
            defaultChecked={d?.transferencia_bancaria}
          />
          <label htmlFor="transferencia" className="form-label" style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--font)" }}>
            Requiere transferencia bancaria
          </label>
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
