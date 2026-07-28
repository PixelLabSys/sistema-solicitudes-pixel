"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Colaborador } from "@/lib/types";

export function FiltrosDashboard({ colaboradores }: { colaboradores: Colaborador[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFiltro(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(clave, valor);
    else params.delete(clave);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <select
        className="form-select"
        defaultValue={searchParams.get("colaborador_id") ?? ""}
        onChange={(e) => setFiltro("colaborador_id", e.target.value)}
      >
        <option value="">Todos los colaboradores</option>
        {colaboradores.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre_completo}
          </option>
        ))}
      </select>
      <select
        className="form-select"
        defaultValue={searchParams.get("tipo") ?? ""}
        onChange={(e) => setFiltro("tipo", e.target.value)}
      >
        <option value="">Todos los tipos</option>
        <option value="permiso">Permiso</option>
        <option value="vacaciones">Vacaciones</option>
        <option value="nomina">Adelanto de nómina</option>
      </select>
      <select
        className="form-select"
        defaultValue={searchParams.get("estado") ?? ""}
        onChange={(e) => setFiltro("estado", e.target.value)}
      >
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobada">Aprobada</option>
        <option value="rechazada">Rechazada</option>
        <option value="cancelada">Cancelada</option>
      </select>
      <input
        type="date"
        className="form-input"
        style={{ width: "auto" }}
        defaultValue={searchParams.get("desde") ?? ""}
        onChange={(e) => setFiltro("desde", e.target.value)}
        title="Radicada desde"
      />
      <input
        type="date"
        className="form-input"
        style={{ width: "auto" }}
        defaultValue={searchParams.get("hasta") ?? ""}
        onChange={(e) => setFiltro("hasta", e.target.value)}
        title="Radicada hasta"
      />
    </div>
  );
}
