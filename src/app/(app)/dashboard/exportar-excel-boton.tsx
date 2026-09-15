"use client";

import { useState } from "react";

export type FilaExport = {
  consecutivo: string;
  colaborador: string;
  tipo: string;
  estado: string;
  lider_aprobador: string;
  radicada: string;
  decidida: string;
  motivo_rechazo: string;
};

export function ExportarExcelBoton({ filas }: { filas: FilaExport[] }) {
  const [exportando, setExportando] = useState(false);

  async function exportar() {
    setExportando(true);
    try {
      const XLSX = await import("xlsx");

      const datos = filas.map((f) => ({
        Consecutivo: f.consecutivo,
        Colaborador: f.colaborador,
        Tipo: f.tipo,
        Estado: f.estado,
        "Líder aprobador": f.lider_aprobador,
        Radicada: f.radicada,
        Decidida: f.decidida,
        "Motivo de rechazo": f.motivo_rechazo,
      }));

      const hoja = XLSX.utils.json_to_sheet(datos);
      hoja["!cols"] = [
        { wch: 12 },
        { wch: 24 },
        { wch: 12 },
        { wch: 12 },
        { wch: 24 },
        { wch: 12 },
        { wch: 12 },
        { wch: 30 },
      ];

      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Solicitudes");

      const fecha = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(libro, `Solicitudes_${fecha}.xlsx`);
    } finally {
      setExportando(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={exportar}
      disabled={exportando || filas.length === 0}
    >
      {exportando ? "Exportando..." : "Exportar Excel"}
    </button>
  );
}
