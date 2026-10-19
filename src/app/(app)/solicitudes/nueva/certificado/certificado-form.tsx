"use client";

import { useState, useTransition } from "react";
import type { Colaborador } from "@/lib/types";
import { crearCargo } from "@/lib/data/catalogos-actions";
import { SelectConCrear } from "@/components/select-con-crear";
import { crearSolicitudCertificado } from "./actions";

export function CertificadoForm({ cargos, colaborador }: { cargos: string[]; colaborador: Colaborador }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await crearSolicitudCertificado(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
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
          <label className="form-label">Cargo actual</label>
          <SelectConCrear
            name="cargo"
            opciones={cargos}
            crearNuevo={crearCargo}
            placeholder="Selecciona un cargo..."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Dirigido a</label>
          <input
            name="destinatario"
            className="form-input"
            maxLength={150}
            required
            placeholder="Ej. Cooperativa JFK"
          />
        </div>

        <div className="form-group form-full">
          <label className="form-label">Motivo de la solicitud</label>
          <textarea
            name="motivo"
            className="form-textarea"
            maxLength={500}
            required
            placeholder="Ej. Trámite de crédito, arriendo, visa..."
          />
        </div>

        <div className="form-group form-full">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <input type="checkbox" name="incluir_salario" />
            Incluir mi salario en el certificado
          </label>
          <p className="form-hint">
            El certificado incluye siempre tu fecha de ingreso, cargo y tipo de contrato. El salario solo aparece si
            marcas esta casilla.
          </p>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
