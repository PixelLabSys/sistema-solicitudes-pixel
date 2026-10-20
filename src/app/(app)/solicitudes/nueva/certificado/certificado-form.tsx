"use client";

import { useState, useTransition } from "react";
import type { Colaborador } from "@/lib/types";
import { crearSolicitudCertificado } from "./actions";

const A_QUIEN_INTERESE = "A quien pueda interesar";

export function CertificadoForm({ rol, colaborador }: { rol: string; colaborador: Colaborador }) {
  const [error, setError] = useState<string | null>(null);
  const [aQuienInterese, setAQuienInterese] = useState(false);
  const [destinatario, setDestinatario] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (aQuienInterese) formData.set("destinatario", A_QUIEN_INTERESE);
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

        <div className="form-group form-full">
          <label className="form-label">Rol que aparece en el certificado</label>
          <input className="form-input" value={rol} disabled />
          <p className="form-hint">Lo define Talento Humano. Si no es correcto, pídeles que lo actualicen.</p>
        </div>

        <div className="form-group form-full">
          <label className="form-label">Dirigido a</label>
          <input
            name="destinatario"
            className="form-input"
            maxLength={150}
            required
            disabled={aQuienInterese}
            value={aQuienInterese ? A_QUIEN_INTERESE : destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder="Ej. Cooperativa JFK"
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 8 }}>
            <input type="checkbox" checked={aQuienInterese} onChange={(e) => setAQuienInterese(e.target.checked)} />
            No tengo un destinatario específico: dirigirlo a &ldquo;{A_QUIEN_INTERESE}&rdquo;
          </label>
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
            El certificado incluye siempre tu fecha de ingreso, rol y tipo de contrato. El salario solo aparece si
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
