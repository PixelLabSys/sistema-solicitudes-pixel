import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type {
  Colaborador,
  EstadoSolicitud,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
} from "@/lib/types";

const TITULOS: Record<Solicitud["tipo"], string> = {
  permiso: "Solicitud de Permiso",
  vacaciones: "Solicitud de Vacaciones",
  nomina: "Solicitud de Adelanto de Nómina",
};

function camposPermiso(d: SolicitudPermisoDetalle): [string, string][] {
  return [
    ["Fecha desde", d.fecha_desde],
    ["Fecha hasta", d.fecha_hasta],
    ["Hora desde", d.hora_desde],
    ["Hora hasta", d.hora_hasta],
    ["Días concedidos", String(d.dias_concedidos)],
    ["Horas concedidas", String(d.horas_concedidas)],
    ["Tipo de permiso", d.tipo_permiso === "medico" ? "Médico" : "Personal"],
    ["Descripción", d.descripcion || "—"],
  ];
}

function camposVacaciones(d: SolicitudVacacionesDetalle): [string, string][] {
  return [
    ["Área", d.area],
    ["Cargo actual", d.cargo_actual],
    ["Tipo de vacaciones", d.tipo_vacaciones === "compensadas" ? "Compensadas" : "Disfrutadas"],
    ["Fecha desde", d.fecha_desde],
    ["Fecha hasta", d.fecha_hasta],
    ["Ingreso a laborar", d.ingreso_a_laborar],
    ["Observaciones", d.observaciones || "—"],
    ["Advertencia 45 días", d.advertencia_45_dias ? "Sí" : "No"],
  ];
}

function camposNomina(d: SolicitudNominaDetalle): [string, string][] {
  const tiposAdelanto: Record<string, string> = {
    nomina: "Adelanto de nómina",
    prima: "Adelanto de prima",
    cuenta_cobro: "Adelanto de cuenta de cobro",
  };
  return [
    ["Cargo", d.cargo],
    ["Tipo de adelanto", tiposAdelanto[d.tipo_adelanto] ?? d.tipo_adelanto],
    ["Valor neto", "$" + Math.round(d.valor_neto).toLocaleString("es-CO")],
    ["Transferencia bancaria", d.transferencia_bancaria ? "Sí" : "No"],
  ];
}

export async function generarPdfSolicitud(params: {
  solicitud: Solicitud;
  colaborador: Colaborador;
  lider: Colaborador;
  detalle: SolicitudPermisoDetalle | SolicitudVacacionesDetalle | SolicitudNominaDetalle;
  estadoFinal: Extract<EstadoSolicitud, "aprobada" | "rechazada">;
  motivoRechazo?: string | null;
  firmaBytes: Uint8Array;
}): Promise<Uint8Array> {
  const { solicitud, colaborador, lider, detalle, estadoFinal, motivoRechazo, firmaBytes } = params;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const marginX = 50;

  function texto(txt: string, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) {
    const size = opts.size ?? 11;
    page.drawText(txt, {
      x: marginX,
      y,
      size,
      font: opts.bold ? fontBold : fontRegular,
      color: opts.color ? rgb(...opts.color) : rgb(0, 0, 0),
    });
    y -= size + 8;
  }

  texto("PIXEL GRAPHIC SAS", { size: 10, color: [0.4, 0.4, 0.4] });
  texto(TITULOS[solicitud.tipo], { size: 18, bold: true });
  texto(`Consecutivo: ${solicitud.consecutivo}`, { size: 11, color: [0.4, 0.4, 0.4] });
  y -= 10;

  texto("Datos del colaborador", { size: 13, bold: true });
  texto(`Nombre: ${colaborador.nombre_completo}`);
  texto(`CC: ${colaborador.cc}`);
  texto(`Correo: ${colaborador.correo}`);
  y -= 6;

  texto("Detalle de la solicitud", { size: 13, bold: true });
  const campos =
    solicitud.tipo === "permiso"
      ? camposPermiso(detalle as SolicitudPermisoDetalle)
      : solicitud.tipo === "vacaciones"
      ? camposVacaciones(detalle as SolicitudVacacionesDetalle)
      : camposNomina(detalle as SolicitudNominaDetalle);

  for (const [label, valor] of campos) {
    texto(`${label}: ${valor}`);
  }
  y -= 6;

  texto("Decisión", { size: 13, bold: true });
  texto(`Líder de proceso: ${lider.nombre_completo}`);
  texto(`Resultado: ${estadoFinal === "aprobada" ? "Aprobada" : "Rechazada"}`, {
    bold: true,
    color: estadoFinal === "aprobada" ? [0.05, 0.4, 0.15] : [0.6, 0.1, 0.1],
  });
  if (estadoFinal === "rechazada" && motivoRechazo) {
    texto(`Motivo: ${motivoRechazo}`);
  }
  texto(`Fecha de decisión: ${new Date().toLocaleString("es-CO")}`);
  y -= 10;

  texto("Firma del colaborador", { size: 13, bold: true });
  try {
    const jpg = await pdf.embedJpg(firmaBytes);
    const dims = jpg.scaleToFit(200, 100);
    page.drawImage(jpg, { x: marginX, y: y - dims.height, width: dims.width, height: dims.height });
    y -= dims.height + 20;
  } catch {
    texto("(no se pudo incrustar la imagen de firma)", { size: 9, color: [0.6, 0.1, 0.1] });
  }

  return pdf.save();
}
