export type Novedad = {
  version: string;
  fecha: string;
  titulo: string;
  puntos: string[];
};

// La más reciente va primero: su versión es la que dispara el aviso rojo del menú.
export const NOVEDADES: Novedad[] = [
  {
    version: "2026-10-19",
    fecha: "19 de octubre de 2026",
    titulo: "Certificado laboral y centro de ayuda",
    puntos: [
      "Nueva solicitud de Certificado laboral: la radicas desde el menú y, cuando se aprueba, descargas el PDF firmado.",
      "Nuevo módulo Ayuda con las novedades del sistema y el manual de usuario de tu rol.",
      "Quien firma los certificados recibe un correo de aviso cada vez que se radica uno nuevo.",
      "Talento Humano ya puede cargar los datos laborales de cada colaborador y definir quién firma los certificados, desde Configuración.",
    ],
  },
  {
    version: "2026-10-09",
    fecha: "9 de octubre de 2026",
    titulo: "Fecha de la última actualización",
    puntos: ["Al final de Configuración se muestra la fecha y hora de la última actualización del sistema."],
  },
  {
    version: "2026-10-05",
    fecha: "5 de octubre de 2026",
    titulo: "Permisos más seguros de radicar",
    puntos: [
      "El formulario de permiso avisa antes de enviar si la hora hasta no es posterior a la hora desde, o si la fecha hasta es anterior a la fecha desde.",
      "Si algo falla al guardar, la solicitud ya no queda a medias en la bandeja de tu líder.",
    ],
  },
  {
    version: "2026-09-16",
    fecha: "16 de septiembre de 2026",
    titulo: "Dashboard más rápido y con indicadores",
    puntos: [
      "Filtros rápidos por periodo: este mes, este trimestre, este semestre, este año o todos.",
      "Nuevas tarjetas con los días de vacaciones, días y horas de permisos otorgados, y los tipos de permisos otorgados, según los filtros activos.",
      "El Excel exportado incluye el detalle de cada solicitud: fechas, horas, días, tipo, cargo y descripción.",
      "Los filtros y el listado cargan mucho más rápido.",
    ],
  },
  {
    version: "2026-09-15",
    fecha: "15 de septiembre de 2026",
    titulo: "Exportar a Excel y PDF: ver o descargar",
    puntos: [
      "Botón Exportar Excel en el Dashboard con el informe de lo que estés filtrando.",
      "Cada solicitud con PDF tiene dos botones: el ojo abre el documento en una pestaña nueva y la flecha lo descarga.",
    ],
  },
  {
    version: "2026-09-01",
    fecha: "1 de septiembre de 2026",
    titulo: "Nuevo diseño, modo oscuro y más velocidad",
    puntos: [
      "El sistema comparte el diseño de los demás sistemas de Pixel Graphic, con modo claro y oscuro.",
      "Tu foto de Google aparece en el menú lateral.",
      "Las pantallas cargan más rápido.",
    ],
  },
  {
    version: "2026-08-10",
    fecha: "10 de agosto de 2026",
    titulo: "Más tipos de permiso y uso en celular",
    puntos: [
      "Nuevos tipos de permiso: Escolar y Judicial.",
      "Los adelantos de nómina los aprueba el Líder General.",
      "El sistema se adapta a celulares y tabletas.",
    ],
  },
];

export const VERSION_ACTUAL = NOVEDADES[0].version;
