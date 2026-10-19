import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont } from "pdf-lib";
import type { Colaborador, SolicitudCertificadoDetalle, TipoContrato } from "@/lib/types";

const NEGRO = rgb(0, 0, 0);
const A4 = { ancho: 595.28, alto: 841.89 };
const MARGEN_X = 70;
const ANCHO_TEXTO = 455;
const TAMANO = 12;
const INTERLINEADO = 20;

const TIPO_CONTRATO_TEXTO: Record<TipoContrato, string> = {
  indefinido: "a término indefinido",
  fijo: "a término fijo",
  obra_labor: "por obra o labor",
  aprendizaje: "de aprendizaje",
};

type Tramo = { texto: string; negrita?: boolean };
type Unidad = { partes: Tramo[]; ancho: number };

function conPuntos(n: number | string) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fechaLarga(fecha: Date, diaDosDigitos: boolean) {
  return fecha.toLocaleDateString("es-CO", {
    day: diaDosDigitos ? "2-digit" : "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}

function fechaDesdeTexto(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T12:00:00-05:00`);
}

export function armarTextoCertificado(params: {
  colaborador: Colaborador;
  detalle: SolicitudCertificadoDetalle;
  datosLaborales: { fecha_ingreso: string; tipo_contrato: TipoContrato; salario: number | null };
  fechaEntrega: Date;
}): { principal: Tramo[]; entrega: Tramo[] } {
  const { colaborador, detalle, datosLaborales, fechaEntrega } = params;
  const femenino = colaborador.genero === "femenino";
  const cc = /^\d+$/.test(colaborador.cc) ? conPuntos(colaborador.cc) : colaborador.cc;

  const salario =
    datosLaborales.salario != null
      ? ` y un salario fijo mensual de $${conPuntos(Math.round(datosLaborales.salario))}`
      : "";

  const principal: Tramo[] = [
    { texto: "PIXEL GRAPHIC SAS", negrita: true },
    { texto: " identificada con " },
    { texto: "NIT 900428247-5", negrita: true },
    { texto: `, Certifica que ${femenino ? "la señora" : "el señor"} ` },
    { texto: colaborador.nombre_completo, negrita: true },
    { texto: ` identificad${femenino ? "a" : "o"} con cédula de ciudadanía ` },
    { texto: `N° ${cc},`, negrita: true },
    {
      texto: ` labora para la empresa desde el ${fechaLarga(fechaDesdeTexto(datosLaborales.fecha_ingreso), true)} a la fecha, desempeñando el cargo de ${detalle.cargo} bajo un contrato ${TIPO_CONTRATO_TEXTO[datosLaborales.tipo_contrato]}${salario}.`,
    },
  ];

  const entrega: Tramo[] = [
    { texto: `Se entrega el presente certificado el ${fechaLarga(fechaEntrega, false)}, a petición del interesado.` },
  ];

  return { principal, entrega };
}

function limpiar(texto: string, font: PDFFont) {
  const soportados = new Set(font.getCharacterSet());
  return [...texto].filter((c) => soportados.has(c.codePointAt(0)!)).join("");
}

function construirUnidades(tramos: Tramo[], regular: PDFFont, negrita: PDFFont): Unidad[] {
  const unidades: Unidad[] = [];
  let espacioPendiente = false;

  for (const tramo of tramos) {
    const font = tramo.negrita ? negrita : regular;
    for (const trozo of limpiar(tramo.texto, font).split(/(\s+)/)) {
      if (!trozo) continue;
      if (/^\s+$/.test(trozo)) {
        espacioPendiente = true;
        continue;
      }
      const ancho = font.widthOfTextAtSize(trozo, TAMANO);
      if (unidades.length > 0 && !espacioPendiente) {
        const ultima = unidades[unidades.length - 1];
        ultima.partes.push({ texto: trozo, negrita: tramo.negrita });
        ultima.ancho += ancho;
      } else {
        unidades.push({ partes: [{ texto: trozo, negrita: tramo.negrita }], ancho });
      }
      espacioPendiente = false;
    }
  }
  return unidades;
}

export async function generarPdfCertificado(params: {
  colaborador: Colaborador;
  detalle: SolicitudCertificadoDetalle;
  datosLaborales: { fecha_ingreso: string; tipo_contrato: TipoContrato; salario: number | null };
  firmante: { nombre: string; cargo: string; telefono: string };
  firmaBytes: Uint8Array;
  fechaEntrega: Date;
  vistaPrevia: boolean;
}): Promise<Uint8Array> {
  const { colaborador, detalle, datosLaborales, firmante, firmaBytes, fechaEntrega, vistaPrevia } = params;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([A4.ancho, A4.alto]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);

  const y = (desdeArriba: number) => A4.alto - desdeArriba;

  if (vistaPrevia) {
    page.drawText("VISTA PREVIA", {
      x: 110,
      y: 250,
      size: 80,
      font: negrita,
      color: rgb(0.85, 0.85, 0.85),
      rotate: degrees(45),
      opacity: 0.5,
    });
  }


  function linea(texto: string, desdeArriba: number, opts: { bold?: boolean; size?: number } = {}) {
    const font = opts.bold ? negrita : regular;
    page.drawText(limpiar(texto, font), {
      x: MARGEN_X,
      y: y(desdeArriba),
      size: opts.size ?? TAMANO,
      font,
      color: NEGRO,
    });
  }

  function parrafoJustificado(tramos: Tramo[], desdeArriba: number): number {
    const unidades = construirUnidades(tramos, regular, negrita);
    const espacio = regular.widthOfTextAtSize(" ", TAMANO);
    const lineas: Unidad[][] = [];
    let actual: Unidad[] = [];
    let anchoActual = 0;

    for (const u of unidades) {
      const necesario = anchoActual + (actual.length ? espacio : 0) + u.ancho;
      if (actual.length && necesario > ANCHO_TEXTO) {
        lineas.push(actual);
        actual = [u];
        anchoActual = u.ancho;
      } else {
        actual.push(u);
        anchoActual = necesario;
      }
    }
    if (actual.length) lineas.push(actual);

    let posY = desdeArriba;
    lineas.forEach((unidadesLinea, i) => {
      const esUltima = i === lineas.length - 1;
      const sumaAnchos = unidadesLinea.reduce((t, u) => t + u.ancho, 0);
      const huecos = unidadesLinea.length - 1;
      const separacion = esUltima || huecos === 0 ? espacio : (ANCHO_TEXTO - sumaAnchos) / huecos;

      let x = MARGEN_X;
      for (const u of unidadesLinea) {
        for (const parte of u.partes) {
          const font = parte.negrita ? negrita : regular;
          page.drawText(parte.texto, { x, y: y(posY), size: TAMANO, font, color: NEGRO });
          x += font.widthOfTextAtSize(parte.texto, TAMANO);
        }
        x += separacion;
      }
      posY += INTERLINEADO;
    });
    return posY;
  }

  // Logo
  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "pixel-logo.png"));
    const logo = await pdf.embedPng(logoBytes);
    const dims = logo.scaleToFit(110, 60);
    page.drawImage(logo, { x: 55, y: y(38) - dims.height, width: dims.width, height: dims.height });
  } catch {
    // sin logo el certificado se genera igual
  }

  // Destinatario
  linea("Señores:", 152, { bold: true, size: 13 });
  linea(detalle.destinatario, 165, { bold: true, size: 13 });
  linea("Ciudad", 178, { bold: true, size: 13 });

  // Cuerpo
  const { principal, entrega } = armarTextoCertificado({ colaborador, detalle, datosLaborales, fechaEntrega });
  const finPrincipal = parrafoJustificado(principal, 235);
  parrafoJustificado(entrega, finPrincipal + 24);

  // Cierre y firma
  linea("Cordialmente,", 425);

  const esPng = firmaBytes[0] === 0x89;
  const firma = esPng ? await pdf.embedPng(firmaBytes) : await pdf.embedJpg(firmaBytes);
  const dimsFirma = firma.scaleToFit(130, 90);
  page.drawImage(firma, {
    x: MARGEN_X,
    y: y(432) - dimsFirma.height,
    width: dimsFirma.width,
    height: dimsFirma.height,
  });

  linea(firmante.nombre, 503);
  linea(firmante.cargo, 525);
  linea(`Teléfono: ${firmante.telefono}`, 545);

  return pdf.save();
}
