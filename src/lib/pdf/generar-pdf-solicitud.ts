import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type {
  Colaborador,
  EstadoSolicitud,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
} from "@/lib/types";

const NAVY = rgb(0.043, 0.106, 0.161); // #0B1B29
const NAVY_HEADER = rgb(0.06, 0.09, 0.14);
const ORANGE = rgb(0.82, 0.53, 0.29); // acento de marca Pixel
const GRIS = rgb(0.42, 0.45, 0.5);
const GRIS_CLARO = rgb(0.6, 0.62, 0.66);
const VERDE = rgb(0.05, 0.4, 0.15);
const ROJO = rgb(0.6, 0.1, 0.1);
const FONDO_NOTAS = rgb(0.96, 0.96, 0.97);

const TITULOS: Record<Solicitud["tipo"], string> = {
  permiso: "Solicitud de Permiso",
  vacaciones: "Solicitud de Vacaciones",
  nomina: "Solicitud de Adelanto de Nómina",
};

const TIPOS_PERMISO_LABEL: Record<string, string> = {
  medico: "Médico",
  personal: "Personal",
  escolar: "Escolar",
  judicial: "Judicial",
};

function camposPermiso(d: SolicitudPermisoDetalle): [string, string][] {
  return [
    ["Área", d.area || "—"],
    ["Cargo actual", d.cargo_actual || "—"],
    ["Fecha desde", d.fecha_desde],
    ["Fecha hasta", d.fecha_hasta],
    ["Hora desde", d.hora_desde],
    ["Hora hasta", d.hora_hasta],
    ["Días concedidos", String(d.dias_concedidos)],
    ["Horas concedidas", String(d.horas_concedidas)],
    ["Tipo de permiso", TIPOS_PERMISO_LABEL[d.tipo_permiso] ?? d.tipo_permiso],
    ["Descripción", d.descripcion || "—"],
    ["Soporte adjunto", d.soporte_url ? "Sí" : "No"],
  ];
}

function camposVacaciones(d: SolicitudVacacionesDetalle): [string, string][] {
  const tiposLabel: Record<string, string> = {
    compensadas: "Compensadas",
    disfrutadas: "Disfrutadas",
    mixtas: "Mixtas",
  };
  const campos: [string, string][] = [
    ["Área", d.area],
    ["Cargo actual", d.cargo_actual],
    ["Tipo de vacaciones", tiposLabel[d.tipo_vacaciones] ?? d.tipo_vacaciones],
  ];
  if (d.tipo_vacaciones === "mixtas" && d.dias_compensados) {
    campos.push(["Días a compensar", String(d.dias_compensados)]);
  }
  campos.push(
    ["Fecha desde", d.fecha_desde],
    ["Fecha hasta", d.fecha_hasta],
    ["Ingreso a laborar", d.ingreso_a_laborar],
    ["Observaciones", d.observaciones || "—"],
    ["Advertencia 45 días", d.advertencia_45_dias ? "Sí" : "No"]
  );
  return campos;
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
  estadoFinal: Extract<EstadoSolicitud, "aprobada" | "rechazada" | "pendiente">;
  motivoRechazo?: string | null;
  firmaBytes: Uint8Array;
}): Promise<Uint8Array> {
  const { solicitud, colaborador, lider, detalle, estadoFinal, motivoRechazo, firmaBytes } = params;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  const marginX = 50;
  const contentWidth = width - marginX * 2;

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // ---- Logo ----
  let logoDims = { width: 0, height: 0 };
  try {
    const logoPath = path.join(process.cwd(), "public", "pixel-logo.png");
    const logoBytes = await readFile(logoPath);
    const logo = await pdf.embedPng(logoBytes);
    logoDims = logo.scaleToFit(90, 55);
    page.drawImage(logo, {
      x: marginX,
      y: 841.89 - 50 - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch {
    // si no se encuentra el logo, se omite sin romper la generación
  }

  let y = 841.89 - 50 - logoDims.height - 14;

  function texto(
    txt: string,
    x: number,
    yPos: number,
    opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; align?: "left" | "right" } = {}
  ) {
    const size = opts.size ?? 10;
    const font = opts.bold ? fontBold : fontRegular;
    const color = opts.color ?? NAVY;
    let drawX = x;
    if (opts.align === "right") {
      const w = font.widthOfTextAtSize(txt, size);
      drawX = x - w;
    }
    page.drawText(txt, { x: drawX, y: yPos, size, font, color });
  }

  // ---- Datos de la empresa ----
  texto("PIXEL GRAPHIC S.A.S", marginX, y, { size: 10, bold: true });
  y -= 13;
  texto("1a # 65 - 10 - 201 Barrio Mallorca", marginX, y, { size: 9, color: GRIS });
  y -= 12;
  texto("Medellín, Antioquia, Colombia 050024", marginX, y, { size: 9, color: GRIS });
  y -= 12;
  texto("NIT: 900428247-5", marginX, y, { size: 9, color: GRIS });

  // ---- Encabezado del documento (columna derecha) ----
  let yDer = 841.89 - 50;
  texto("SISTEMA DE SOLICITUDES", width - marginX, yDer, { size: 9, color: GRIS, align: "right", bold: true });
  yDer -= 14;
  texto(`Radicado por: ${colaborador.nombre_completo}`, width - marginX, yDer, { size: 9, color: GRIS, align: "right" });
  yDer -= 12;
  texto(`Correo: ${colaborador.correo}`, width - marginX, yDer, { size: 9, color: GRIS, align: "right" });

  y -= 34;

  texto(`# ${solicitud.consecutivo}`, marginX, y, { size: 22, bold: true });
  y -= 22;
  texto(TITULOS[solicitud.tipo].toUpperCase(), marginX, y, { size: 13, bold: true, color: ORANGE });
  y -= 16;
  if (estadoFinal === "pendiente") {
    texto("VISTA PREVIA — AÚN NO DECIDIDA", marginX, y, { size: 9, bold: true, color: rgb(0.7, 0.5, 0) });
    y -= 13;
  }
  texto(
    estadoFinal === "pendiente"
      ? `Radicada: ${new Date(solicitud.creado_en).toLocaleDateString("es-CO")}`
      : `Radicada: ${new Date(solicitud.creado_en).toLocaleDateString("es-CO")}   ·   Decidida: ${new Date().toLocaleDateString("es-CO")}`,
    marginX,
    y,
    { size: 9, color: GRIS }
  );

  y -= 30;
  texto("Datos del colaborador", marginX, y, { size: 12, bold: true, color: ORANGE });
  y -= 18;
  texto(`Nombre: ${colaborador.nombre_completo}`, marginX, y, { size: 10 });
  y -= 14;
  texto(`CC: ${colaborador.cc}`, marginX, y, { size: 10 });
  y -= 14;
  texto(`Correo: ${colaborador.correo}`, marginX, y, { size: 10 });

  y -= 28;

  // ---- Tabla de detalle (encabezado oscuro, estilo cotización) ----
  const campos =
    solicitud.tipo === "permiso"
      ? camposPermiso(detalle as SolicitudPermisoDetalle)
      : solicitud.tipo === "vacaciones"
      ? camposVacaciones(detalle as SolicitudVacacionesDetalle)
      : camposNomina(detalle as SolicitudNominaDetalle);

  const filaAlto = 22;
  const headerAlto = 24;
  const colCampoX = marginX + 12;
  const colValorX = marginX + contentWidth * 0.45;

  page.drawRectangle({
    x: marginX,
    y: y - headerAlto,
    width: contentWidth,
    height: headerAlto,
    color: NAVY_HEADER,
  });
  texto("CAMPO", colCampoX, y - headerAlto + 8, { size: 9, bold: true, color: rgb(1, 1, 1) });
  texto("VALOR", colValorX, y - headerAlto + 8, { size: 9, bold: true, color: rgb(1, 1, 1) });
  y -= headerAlto;

  campos.forEach(([campo, valor], i) => {
    if (i % 2 === 1) {
      page.drawRectangle({
        x: marginX,
        y: y - filaAlto,
        width: contentWidth,
        height: filaAlto,
        color: rgb(0.97, 0.97, 0.98),
      });
    }
    texto(campo, colCampoX, y - filaAlto + 7, { size: 9.5 });
    texto(valor, colValorX, y - filaAlto + 7, { size: 9.5 });
    y -= filaAlto;
  });

  page.drawLine({
    start: { x: marginX, y },
    end: { x: marginX + contentWidth, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.87),
  });

  y -= 26;

  // ---- Resultado de la decisión (bloque tipo "totales", alineado a la derecha) ----
  const resultadoLabel =
    estadoFinal === "aprobada" ? "Aprobada" : estadoFinal === "rechazada" ? "Rechazada" : "Pendiente";
  const resultadoColor = estadoFinal === "aprobada" ? VERDE : estadoFinal === "rechazada" ? ROJO : rgb(0.7, 0.5, 0);

  texto("Líder de proceso", marginX + contentWidth - 220, y, { size: 9.5, color: GRIS });
  texto(lider.nombre_completo, marginX + contentWidth, y, { size: 9.5, align: "right" });
  y -= 15;
  if (estadoFinal !== "pendiente") {
    texto("Fecha de decisión", marginX + contentWidth - 220, y, { size: 9.5, color: GRIS });
    texto(new Date().toLocaleDateString("es-CO"), marginX + contentWidth, y, { size: 9.5, align: "right" });
    y -= 4;
  }
  page.drawLine({
    start: { x: marginX + contentWidth - 220, y: y - 4 },
    end: { x: marginX + contentWidth, y: y - 4 },
    thickness: 0.75,
    color: NAVY,
  });
  y -= 22;
  texto("Resultado", marginX + contentWidth - 220, y, { size: 12, bold: true });
  texto(resultadoLabel, marginX + contentWidth, y, { size: 12, bold: true, color: resultadoColor, align: "right" });

  if (estadoFinal === "rechazada" && motivoRechazo) {
    y -= 20;
    texto(`Motivo: ${motivoRechazo}`, marginX, y, { size: 9.5, color: GRIS });
  }

  y -= 40;

  // ---- Firma ----
  texto("Firma del colaborador", marginX, y, { size: 11, bold: true, color: ORANGE });
  y -= 14;
  try {
    const jpg = await pdf.embedJpg(firmaBytes);
    const dims = jpg.scaleToFit(180, 90);
    page.drawImage(jpg, { x: marginX, y: y - dims.height, width: dims.width, height: dims.height });
    y -= dims.height + 16;
  } catch {
    texto("(no se pudo incrustar la imagen de firma)", marginX, y, { size: 9, color: ROJO });
    y -= 20;
  }

  // ---- Notas (caja gris al final, estilo cotización) ----
  const notaTexto =
    "Este documento fue generado automáticamente por el Sistema de Solicitudes de PIXEL GRAPHIC SAS al momento de la decisión. " +
    "Constituye el registro oficial de la solicitud, incluida la firma del colaborador y el resultado de la aprobación.";
  const notaAlto = 50;
  page.drawRectangle({
    x: marginX,
    y: y - notaAlto,
    width: contentWidth,
    height: notaAlto,
    color: FONDO_NOTAS,
  });
  texto("Notas:", marginX + 12, y - 16, { size: 9, bold: true });
  drawTextWrapped(page, notaTexto, marginX + 12, y - 30, contentWidth - 24, 9, fontRegular, GRIS_CLARO);

  return pdf.save();
}

function drawTextWrapped(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>
) {
  const palabras = text.split(" ");
  let linea = "";
  let yPos = y;
  for (const palabra of palabras) {
    const pruebaLinea = linea ? `${linea} ${palabra}` : palabra;
    if (font.widthOfTextAtSize(pruebaLinea, size) > maxWidth) {
      page.drawText(linea, { x, y: yPos, size, font, color });
      linea = palabra;
      yPos -= size + 3;
    } else {
      linea = pruebaLinea;
    }
  }
  if (linea) {
    page.drawText(linea, { x, y: yPos, size, font, color });
  }
}
