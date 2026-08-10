"use client";

import { useState, useTransition } from "react";
import type { Colaborador } from "@/lib/types";
import { actualizarRoles, alternarActivo } from "./actions";

export function ColaboradorRow({
  colaborador,
  esYo,
}: {
  colaborador: Colaborador;
  esYo: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(campo: "es_lider_area" | "es_lider_th" | "es_lider_general", valorActual: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await actualizarRoles(colaborador.id, { [campo]: !valorActual });
      if (res?.error) setError(res.error);
    });
  }

  function toggleActivo() {
    setError(null);
    startTransition(async () => {
      const res = await alternarActivo(colaborador.id, !colaborador.activo);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <tr>
      <td>
        {colaborador.nombre_completo}
        {esYo && <span className="badge badge-blue" style={{ marginLeft: 6 }}>tú</span>}
      </td>
      <td className="td-mono">{colaborador.correo}</td>
      <td className="td-mono">{colaborador.cc}</td>
      <td>
        <input
          type="checkbox"
          checked={colaborador.es_lider_area}
          disabled={pending}
          onChange={() => toggle("es_lider_area", colaborador.es_lider_area)}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={colaborador.es_lider_th}
          disabled={pending}
          onChange={() => toggle("es_lider_th", colaborador.es_lider_th)}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={colaborador.es_lider_general}
          disabled={pending}
          onChange={() => toggle("es_lider_general", colaborador.es_lider_general)}
        />
      </td>
      <td>
        <span className={`badge ${colaborador.activo ? "badge-green" : "badge-gray"}`}>
          {colaborador.activo ? "Activo" : "Inactivo"}
        </span>
        {error && <div className="form-error" style={{ marginTop: 4 }}>{error}</div>}
      </td>
      <td>
        <button
          className="btn btn-ghost btn-sm"
          disabled={pending || esYo}
          onClick={toggleActivo}
        >
          {colaborador.activo ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}
