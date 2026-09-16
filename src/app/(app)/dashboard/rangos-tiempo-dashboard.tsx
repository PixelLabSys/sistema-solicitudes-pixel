"use client";

import { useRouter, useSearchParams } from "next/navigation";

function fmt(fecha: Date) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calcularRango(id: string): { desde: string; hasta: string } | null {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();

  if (id === "mes") {
    return { desde: fmt(new Date(anio, mes, 1)), hasta: fmt(new Date(anio, mes + 1, 0)) };
  }
  if (id === "trimestre") {
    const inicioTrimestre = Math.floor(mes / 3) * 3;
    return {
      desde: fmt(new Date(anio, inicioTrimestre, 1)),
      hasta: fmt(new Date(anio, inicioTrimestre + 3, 0)),
    };
  }
  if (id === "semestre") {
    const inicioSemestre = mes < 6 ? 0 : 6;
    return {
      desde: fmt(new Date(anio, inicioSemestre, 1)),
      hasta: fmt(new Date(anio, inicioSemestre + 6, 0)),
    };
  }
  if (id === "anio") {
    return { desde: fmt(new Date(anio, 0, 1)), hasta: fmt(new Date(anio, 11, 31)) };
  }
  return null;
}

const OPCIONES = [
  { id: "mes", label: "Este mes" },
  { id: "trimestre", label: "Este trimestre" },
  { id: "semestre", label: "Este semestre" },
  { id: "anio", label: "Este año" },
  { id: "todos", label: "Todos" },
];

export function RangosTiempoDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const desdeActual = searchParams.get("desde") ?? "";
  const hastaActual = searchParams.get("hasta") ?? "";

  function aplicar(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    const rango = calcularRango(id);
    if (rango) {
      params.set("desde", rango.desde);
      params.set("hasta", rango.hasta);
    } else {
      params.delete("desde");
      params.delete("hasta");
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  function estaActivo(id: string) {
    const rango = calcularRango(id);
    if (!rango) return !desdeActual && !hastaActual;
    return desdeActual === rango.desde && hastaActual === rango.hasta;
  }

  return (
    <div className="filtros-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {OPCIONES.map((op) => (
        <button
          key={op.id}
          type="button"
          className={`btn btn-sm ${estaActivo(op.id) ? "btn-primary" : "btn-ghost"}`}
          onClick={() => aplicar(op.id)}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
