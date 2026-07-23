"use client";

import { useRef, useState, useTransition } from "react";
import { crearColaborador } from "./actions";

export function ColaboradorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await crearColaborador(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}
      <div className="form-grid-3" style={{ display: "grid", gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input name="nombre_completo" className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Correo</label>
          <input name="correo" type="email" className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">CC</label>
          <input name="cc" className="form-input" required />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={pending}>
        {pending ? "Agregando..." : "Agregar colaborador"}
      </button>
    </form>
  );
}
