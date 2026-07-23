"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FiltrosDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFiltro(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(clave, valor);
    else params.delete(clave);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
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
    </div>
  );
}
