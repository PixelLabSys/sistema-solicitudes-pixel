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
  area: string;
  cargo: string;
  fecha_desde: string;
  fecha_hasta: string;
  hora_desde: string;
  hora_hasta: string;
  dias_concedidos: number | string;
  horas_concedidas: number | string;
  tipo_detalle: string;
  dias_compensados: number | string;
  ingreso_a_laborar: string;
  valor_neto: number | string;
  transferencia_bancaria: string;
  descripcion: string;
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
        Área: f.area,
        Cargo: f.cargo,
        "Fecha desde": f.fecha_desde,
        "Fecha hasta": f.fecha_hasta,
        "Hora desde": f.hora_desde,
        "Hora hasta": f.hora_hasta,
        "Días concedidos": f.dias_concedidos,
        "Horas concedidas": f.horas_concedidas,
        "Tipo específico": f.tipo_detalle,
        "Días compensados": f.dias_compensados,
        "Ingreso a laborar": f.ingreso_a_laborar,
        "Valor neto": f.valor_neto,
        "Transferencia bancaria": f.transferencia_bancaria,
        "Descripción / Observaciones": f.descripcion,
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
        { wch: 16 },
        { wch: 16 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
        { wch: 34 },
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
