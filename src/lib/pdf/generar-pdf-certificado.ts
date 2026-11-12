import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Colaborador, SolicitudCertificadoDetalle, TipoContrato } from "@/lib/types";

const OSCURO = rgb(0.17, 0.14, 0.13);
const BLANCO = rgb(1, 1, 1);
const LETTER = { ancho: 612, alto: 792 };
const MARGEN_X = 69;
const ANCHO = 476;
const TAMANO = 10.5;
const INTERLINEADO = 17;

// Respaldo si un firmante aún no tiene correo configurado.
const CORREO_CERTIFICADOS = "gestiondeltalento@pixel-g.com";
const SITIO_WEB = "https://pixelgraphicmed.com/";

const TIPO_CONTRATO_TEXTO: Record<TipoContrato, string> = {
  indefinido: "Término indefinido",
  fijo: "Término fijo",
  obra_labor: "Obra o labor",
  aprendizaje: "Aprendizaje",
};

type Tramo = { texto: string; negrita?: boolean };
type Unidad = { partes: Tramo[]; ancho: number };

function conPuntos(n: number | string) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fechaConDiaSemana(fecha: Date) {
  const texto = fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
  return texto.charAt(0).toLocaleUpperCase("es") + texto.slice(1);
}

function fechaEnPartes(fecha: Date) {
  const partes = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return { dia: valor("day"), mes: valor("month"), anio: valor("year") };
}

function fechaCorta(yyyyMmDd: string) {
  const [anio, mes, dia] = yyyyMmDd.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Siempre empieza en mayúscula. "A quien pueda interesar" va solo y en letra regular; un
// destinatario específico (banco, entidad, persona) va en negrita, entre "Señores:" y "Ciudad".
export function formatearDestinatario(destinatario: string): { texto: string; negrita: boolean } {
  const limpio = destinatario.trim().replace(/\s+/g, " ");
  const texto = limpio.charAt(0).toLocaleUpperCase("es") + limpio.slice(1);
  const generico = texto.replace(/[.\s]+$/, "").toLocaleLowerCase("es") === "a quien pueda interesar";
  return { texto, negrita: !generico };
}

function limpiar(texto: string, font: PDFFont) {
  const soportados = new Set(font.getCharacterSet());
  return [...texto].filter((c) => soportados.has(c.codePointAt(0)!)).join("");
}

function construirUnidades(tramos: Tramo[], regular: PDFFont, negrita: PDFFont, size: number): Unidad[] {
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
      const ancho = font.widthOfTextAtSize(trozo, size);
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

function partirEnLineas(texto: string, font: PDFFont, size: number, anchoMax: number): string[] {
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of limpiar(texto, font).split(/\s+/).filter(Boolean)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (actual && font.widthOfTextAtSize(prueba, size) > anchoMax) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// Rectángulo con esquinas redondeadas; con soloArriba solo se redondean las superiores.
function rectanguloRedondeado(w: number, h: number, r: number, soloArriba = false) {
  if (soloArriba) {
    return `M 0 ${h} L 0 ${r} Q 0 0 ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h} Z`;
  }
  return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
}

export async function generarPdfCertificado(params: {
  colaborador: Colaborador;
  detalle: SolicitudCertificadoDetalle;
  datosLaborales: { fecha_ingreso: string; tipo_contrato: TipoContrato; salario: number | null };
  firmante: { nombre: string; cargo: string; telefono: string; correo?: string | null };
  firmaBytes: Uint8Array;
  fechaEntrega: Date;
  vistaPrevia: boolean;
}): Promise<Uint8Array> {
  const { colaborador, detalle, datosLaborales, firmante, firmaBytes, fechaEntrega, vistaPrevia } = params;

  const pdf = await PDFDocument.create();

  // El papel membrete (banda superior y pie) es un PDF de Pixel que se usa como fondo; si
  // faltara el archivo, el certificado se genera igual sobre una hoja Carta en blanco.
  let page: PDFPage;
  try {
    const bytesMembrete = await readFile(path.join(process.cwd(), "public", "plantillas", "membrete-certificado.pdf"));
    const [membrete] = await pdf.embedPdf(bytesMembrete, [0]);
    page = pdf.addPage([membrete.width, membrete.height]);
    page.drawPage(membrete);
  } catch {
    page = pdf.addPage([LETTER.ancho, LETTER.alto]);
  }

  const alto = page.getHeight();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);

  const y = (desdeArriba: number) => alto - desdeArriba;

  function texto(
    txt: string,
    x: number,
    desdeArriba: number,
    opts: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) {
    const font = opts.bold ? negrita : regular;
    page.drawText(limpiar(txt, font), {
      x,
      y: y(desdeArriba),
      size: opts.size ?? TAMANO,
      font,
      color: opts.color ?? OSCURO,
    });
  }

  function textoCentrado(txt: string, centroX: number, desdeArriba: number, size: number, bold = false, color = OSCURO) {
    const font = bold ? negrita : regular;
    const limpio = limpiar(txt, font);
    page.drawText(limpio, {
      x: centroX - font.widthOfTextAtSize(limpio, size) / 2,
      y: y(desdeArriba),
      size,
      font,
      color,
    });
  }

  function parrafo(tramos: Tramo[], desdeArriba: number): number {
    const unidades = construirUnidades(tramos, regular, negrita, TAMANO);
    const espacio = regular.widthOfTextAtSize(" ", TAMANO);
    const lineas: Unidad[][] = [];
    let actual: Unidad[] = [];
    let anchoActual = 0;

    for (const u of unidades) {
      const necesario = anchoActual + (actual.length ? espacio : 0) + u.ancho;
      if (actual.length && necesario > ANCHO) {
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
    for (const unidadesLinea of lineas) {
      let x = MARGEN_X;
      for (const u of unidadesLinea) {
        for (const parte of u.partes) {
          const font = parte.negrita ? negrita : regular;
          page.drawText(parte.texto, { x, y: y(posY), size: TAMANO, font, color: OSCURO });
          x += font.widthOfTextAtSize(parte.texto, TAMANO);
        }
        x += espacio;
      }
      posY += INTERLINEADO;
    }
    return posY;
  }

  if (vistaPrevia) {
    page.drawText("VISTA PREVIA", {
      x: 110,
      y: 230,
      size: 80,
      font: negrita,
      color: rgb(0.85, 0.85, 0.85),
      rotate: degrees(45),
      opacity: 0.5,
    });
  }

  // ---- Fecha y destinatario ----
  texto(fechaConDiaSemana(fechaEntrega), MARGEN_X, 191);

  const destinatario = formatearDestinatario(detalle.destinatario);
  if (destinatario.negrita) {
    texto("Señores:", MARGEN_X, 251);
    texto(destinatario.texto, MARGEN_X, 266, { bold: true });
    texto("Ciudad", MARGEN_X, 281);
  } else {
    texto(destinatario.texto, MARGEN_X, 266);
  }

  // ---- Cuerpo ----
  const femenino = colaborador.genero === "femenino";
  const cc = /^\d+$/.test(colaborador.cc) ? conPuntos(colaborador.cc) : colaborador.cc;
  const o_a = femenino ? "a" : "o";

  const finParrafo = parrafo(
    [
      { texto: "PIXEL GRAPHIC SAS", negrita: true },
      { texto: " identificada con " },
      { texto: "NIT 900428247-5", negrita: true },
      { texto: `, certifica que ${femenino ? "la señora" : "el señor"} ` },
      { texto: colaborador.nombre_completo, negrita: true },
      { texto: ` identificad${o_a} con cédula de ciudadanía ` },
      { texto: `N° ${cc}`, negrita: true },
      {
        texto: `, a la fecha de expedición de este certificado, se encuentra vinculad${o_a} laboralmente con la empresa en las siguientes condiciones:`,
      },
    ],
    323
  );

  // ---- Tabla ----
  const incluyeSalario = datosLaborales.salario != null;
  const columnas: { titulo: string[]; ancho: number; valor: string }[] = incluyeSalario
    ? [
        { titulo: ["Cargo"], ancho: 150, valor: detalle.cargo },
        { titulo: ["Fecha de ingreso", "dd/mm/aaaa"], ancho: 88, valor: fechaCorta(datosLaborales.fecha_ingreso) },
        { titulo: ["Tipo de contrato"], ancho: 100, valor: TIPO_CONTRATO_TEXTO[datosLaborales.tipo_contrato] },
        { titulo: ["Salario mensual"], ancho: 82, valor: `$${conPuntos(Math.round(datosLaborales.salario!))}` },
        { titulo: ["Estado"], ancho: ANCHO - 150 - 88 - 100 - 82, valor: "Activo" },
      ]
    : [
        { titulo: ["Cargo"], ancho: 175, valor: detalle.cargo },
        { titulo: ["Fecha de ingreso", "dd/mm/aaaa"], ancho: 105, valor: fechaCorta(datosLaborales.fecha_ingreso) },
        { titulo: ["Tipo de contrato"], ancho: 125, valor: TIPO_CONTRATO_TEXTO[datosLaborales.tipo_contrato] },
        { titulo: ["Estado"], ancho: ANCHO - 175 - 105 - 125, valor: "Activo" },
      ];

  const TAM_CELDA = 9.5;
  const lineasPorColumna = columnas.map((c) => partirEnLineas(c.valor, regular, TAM_CELDA, c.ancho - 14));
  const maxLineas = Math.max(...lineasPorColumna.map((l) => l.length));
  const altoEncabezado = 36;
  const altoFila = Math.max(30, maxLineas * 12 + 16);
  const topTabla = finParrafo + 12;

  page.drawSvgPath(rectanguloRedondeado(ANCHO, altoEncabezado + altoFila, 6), {
    x: MARGEN_X,
    y: y(topTabla),
    borderColor: OSCURO,
    borderWidth: 1,
  });
  page.drawSvgPath(rectanguloRedondeado(ANCHO, altoEncabezado, 6, true), {
    x: MARGEN_X,
    y: y(topTabla),
    color: OSCURO,
  });

  let xCol = MARGEN_X;
  columnas.forEach((col, i) => {
    const centro = xCol + col.ancho / 2;
    if (col.titulo.length === 1) {
      textoCentrado(col.titulo[0], centro, topTabla + 22, 9.5, true, BLANCO);
    } else {
      textoCentrado(col.titulo[0], centro, topTabla + 16, 9.5, true, BLANCO);
      textoCentrado(col.titulo[1], centro, topTabla + 28, 7.5, false, BLANCO);
    }

    const lineas = lineasPorColumna[i];
    const bloque = lineas.length * 12;
    const inicio = topTabla + altoEncabezado + (altoFila - bloque) / 2 + 9;
    lineas.forEach((l, j) => textoCentrado(l, centro, inicio + j * 12, TAM_CELDA));
    xCol += col.ancho;
  });

  // ---- Nota ----
  const { dia, mes, anio } = fechaEnPartes(fechaEntrega);
  const yNota = topTabla + altoEncabezado + altoFila + 28;
  const TAM_NOTA = 9;
  const anchoImportante = negrita.widthOfTextAtSize("*Importante:", TAM_NOTA);
  const resto = `Este certificado se expide a petición del interesado el día ${dia} del mes de ${mes} del año ${anio}.`;

  // La primera línea comparte renglón con "*Importante:"; las siguientes usan todo el ancho.
  const lineasNota: string[] = [];
  let lineaNota = "";
  for (const palabra of limpiar(resto, regular).split(/\s+/)) {
    const limite = lineasNota.length === 0 ? ANCHO - anchoImportante - 4 : ANCHO;
    const prueba = lineaNota ? `${lineaNota} ${palabra}` : palabra;
    if (lineaNota && regular.widthOfTextAtSize(prueba, TAM_NOTA) > limite) {
      lineasNota.push(lineaNota);
      lineaNota = palabra;
    } else {
      lineaNota = prueba;
    }
  }
  if (lineaNota) lineasNota.push(lineaNota);

  texto("*Importante:", MARGEN_X, yNota, { bold: true, size: TAM_NOTA });
  lineasNota.forEach((l, i) =>
    texto(l, i === 0 ? MARGEN_X + anchoImportante + 4 : MARGEN_X, yNota + i * 11.5, { size: TAM_NOTA })
  );

  // ---- Firma y datos de quien firma ----
  const topFirma = yNota + 26 + (lineasNota.length - 1) * 11.5;
  const esPng = firmaBytes[0] === 0x89;
  const firma = esPng ? await pdf.embedPng(firmaBytes) : await pdf.embedJpg(firmaBytes);
  const dimsFirma = firma.scaleToFit(150, 100);
  // La firma se ancla por abajo, justo encima del nombre, sin importar su alto: así una
  // firma ancha queda pegada al bloque de datos y una alta ocupa el espacio disponible.
  page.drawImage(firma, {
    x: MARGEN_X,
    y: y(topFirma + 104),
    width: dimsFirma.width,
    height: dimsFirma.height,
  });

  const TAM_FIRMA = 9.5;
  const PASO = 12;
  let yDatos = topFirma + 116;
  texto(firmante.nombre, MARGEN_X, yDatos, { size: TAM_FIRMA });
  yDatos += PASO;
  texto(firmante.cargo, MARGEN_X, yDatos, { size: TAM_FIRMA });
  yDatos += PASO;
  texto("PIXEL GRAPHIC S.A.S.", MARGEN_X, yDatos, { bold: true, size: TAM_FIRMA });
  yDatos += PASO;
  texto(firmante.telefono, MARGEN_X, yDatos, { size: TAM_FIRMA });
  yDatos += PASO;
  texto(firmante.correo?.trim() || CORREO_CERTIFICADOS, MARGEN_X, yDatos, { size: TAM_FIRMA });
  yDatos += PASO;
  texto(SITIO_WEB, MARGEN_X, yDatos, { size: TAM_FIRMA });

  return pdf.save();
}
