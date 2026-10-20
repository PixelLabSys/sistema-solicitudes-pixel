export type RolAyuda = "colaborador" | "lider_area" | "lider_th" | "lider_general";

export type SeccionManual = {
  titulo: string;
  parrafo?: string;
  pasos?: string[];
};

export type Manual = {
  rol: RolAyuda;
  etiqueta: string;
  resumen: string;
  secciones: SeccionManual[];
};

export const MANUALES: Record<RolAyuda, Manual> = {
  colaborador: {
    rol: "colaborador",
    etiqueta: "Colaborador",
    resumen:
      "Con este sistema radicas tus permisos, vacaciones, adelantos de nómina y certificados laborales, y sigues el estado de cada uno.",
    secciones: [
      {
        titulo: "Radicar un permiso",
        pasos: [
          "En el menú elige Nueva: Permiso.",
          "Indica tu área y cargo, las fechas y horas del permiso, el tipo (médico, personal, escolar o judicial) y una descripción.",
          "La hora hasta debe ser posterior a la hora desde, y la fecha hasta no puede ser anterior a la fecha desde.",
          "Si tienes un soporte (por ejemplo, una incapacidad), adjúntalo en PDF, JPG o PNG de hasta 5 MB. Es opcional.",
          "Elige a tu líder de proceso, sube tu firma en JPG de hasta 2 MB y pulsa Enviar solicitud.",
        ],
      },
      {
        titulo: "Radicar vacaciones",
        pasos: [
          "Elige Nueva: Vacaciones.",
          "Selecciona el tipo: compensadas, disfrutadas o mixtas. En las mixtas indicas cuántos días se compensan (de 1 a 30) y el resto se entiende como disfrutado.",
          "Completa las fechas de descanso y la fecha de ingreso a laborar.",
          "Si radicas con menos de 45 días de anticipación el sistema te lo advierte, pero puedes continuar: la decisión final es de tu líder.",
          "Elige a tu líder de proceso, sube tu firma y envía.",
        ],
      },
      {
        titulo: "Pedir un adelanto de nómina",
        pasos: [
          "Elige Nueva: Adelanto.",
          "Selecciona tu cargo, el tipo de adelanto (nómina, prima o cuenta de cobro) y el valor neto. Marca si requiere transferencia bancaria.",
          "Sube tu firma y envía. La solicitud le llega automáticamente al Líder General.",
          "El sistema solo registra la solicitud; el pago lo gestiona Talento Humano por fuera del sistema.",
        ],
      },
      {
        titulo: "Pedir un certificado laboral",
        pasos: [
          "Elige Nueva: Certificado Laboral.",
          "Revisa el rol que aparecerá en el certificado (lo define Talento Humano), escribe a quién va dirigido (por ejemplo, el nombre del banco) o marca la casilla para dirigirlo a \"A quien pueda interesar\", y escribe el motivo.",
          "Marca la casilla solo si quieres que el certificado incluya tu salario. La fecha de ingreso, el rol y el tipo de contrato aparecen siempre.",
          "No necesitas firma. Quien firma los certificados revisa tu solicitud y, al aprobarla, descargas el PDF desde Mis solicitudes.",
          "Si el formulario te dice que faltan tus datos laborales, escribe a Talento Humano para que los carguen.",
          "Un certificado no se puede editar: si te equivocaste, cancélalo y radica uno nuevo.",
        ],
      },
      {
        titulo: "Seguir tus solicitudes",
        parrafo:
          "En Mis solicitudes ves el historial con su estado: Pendiente (esperando decisión), Aprobada, Rechazada (se muestra el motivo) o Cancelada. Recibes un correo cuando tu solicitud es decidida.",
        pasos: [
          "Mientras esté Pendiente puedes editarla o cancelarla (los certificados solo se cancelan).",
          "Cuando hay PDF, el ojo lo abre en una pestaña nueva y la flecha lo descarga.",
        ],
      },
      {
        titulo: "Consejos",
        pasos: [
          "En la parte inferior del menú puedes cambiar entre modo claro y oscuro.",
          "En el celular, abre el menú con el botón de arriba a la izquierda.",
        ],
      },
    ],
  },

  lider_area: {
    rol: "lider_area",
    etiqueta: "Líder de área",
    resumen:
      "Como líder de área decides las solicitudes de las personas que te eligen como líder de proceso y consultas el historial de tu equipo.",
    secciones: [
      {
        titulo: "Cómo te llegan las solicitudes",
        parrafo:
          "Cuando un colaborador te elige como líder de proceso, te llega un correo de aviso y la solicitud aparece en tu Bandeja de aprobación. No puedes aprobar tus propias solicitudes: esas se asignan a otra persona.",
      },
      {
        titulo: "Aprobar o rechazar",
        pasos: [
          "Abre la Bandeja de aprobación: cada tarjeta resume la solicitud.",
          "Pulsa Ver solicitud para abrir el documento completo en una pestaña nueva. Si el colaborador adjuntó un soporte, también puedes abrirlo con Ver soporte.",
          "Pulsa Aprobar para aprobarla: el sistema genera el PDF y avisa al colaborador.",
          "Pulsa Rechazar y escribe el motivo, que es obligatorio, y confirma el rechazo.",
        ],
      },
      {
        titulo: "Dashboard de mi equipo",
        pasos: [
          "Muestra las solicitudes en las que fuiste elegido como líder de proceso.",
          "Filtra por periodo (este mes, trimestre, semestre, año o todos), colaborador, tipo, estado y rango de fechas.",
          "Las tarjetas se recalculan con los filtros: pendientes, aprobadas, rechazadas, días de vacaciones y de permisos otorgados, horas y tipos de permisos.",
          "Exportar Excel descarga lo que estés viendo, con el detalle de cada solicitud.",
        ],
      },
      {
        titulo: "Si eres quien firma los certificados laborales",
        parrafo:
          "Las solicitudes de certificado llegan también a tu Bandeja. La vista previa muestra el certificado con la marca VISTA PREVIA; al aprobarlo se genera el PDF definitivo con tu firma.",
      },
      {
        titulo: "Tus propias solicitudes",
        parrafo: "También puedes radicar permisos, vacaciones, adelantos y certificados: consulta el manual de Colaborador.",
      },
    ],
  },

  lider_th: {
    rol: "lider_th",
    etiqueta: "Líder de Talento Humano",
    resumen:
      "Talento Humano administra a las personas, los catálogos y los datos laborales, y ve el historial completo de solicitudes.",
    secciones: [
      {
        titulo: "Dashboard",
        pasos: [
          "Muestra el historial de todas las solicitudes de todos los colaboradores.",
          "Usa los filtros rápidos de periodo y los demás filtros; las tarjetas de indicadores se recalculan con ellos.",
          "Exportar Excel descarga el informe filtrado, con el detalle de cada solicitud.",
          "Recibes un correo cuando se aprueba una solicitud.",
        ],
      },
      {
        titulo: "Colaboradores",
        pasos: [
          "En Configuración, Nuevo colaborador: escribe nombre completo, correo y cédula.",
          "También puedes importar varios desde Excel con las columnas Nombre Completo, Correo y CC.",
          "En la tabla de colaboradores asignas los roles: Líder de área, Líder de TH y Líder General.",
          "No se puede quitar el rol de líder de área ni desactivar a una persona que tenga solicitudes pendientes asignadas.",
          "Solo puede haber un Líder General.",
        ],
      },
      {
        titulo: "Catálogos de áreas y cargos",
        pasos: [
          "En Configuración, las secciones Áreas y Cargos permiten crear, editar y activar o desactivar opciones.",
          "Los colaboradores las ven como listas al radicar sus solicitudes.",
        ],
      },
      {
        titulo: "Datos laborales para certificados",
        pasos: [
          "En Configuración, sección Datos laborales, completa por cada colaborador: rol (el nombre con el que sale en la carta), género, fecha de ingreso, tipo de contrato y salario mensual, y pulsa Guardar.",
          "El estado Completo significa que la persona ya puede pedir su certificado; con Incompleto, el formulario le pide que te escriba.",
          "El salario solo lo ven Talento Humano y el propio colaborador. Quien aprueba un certificado solo recibe el salario cuando el colaborador pidió incluirlo.",
        ],
      },
      {
        titulo: "Quién firma los certificados",
        pasos: [
          "En Configuración, sección Certificado laboral, elige al aprobador y firmante principal.",
          "Para cada firmante (el principal y el Líder General) configura su cargo, su teléfono y la imagen de su firma (JPG o PNG de hasta 2 MB).",
          "En cada certificado firma quien lo aprueba. Si el firmante principal pide su propio certificado, lo aprueba y lo firma el Líder General.",
        ],
      },
    ],
  },

  lider_general: {
    rol: "lider_general",
    etiqueta: "Líder General",
    resumen:
      "El Líder General decide los adelantos de nómina y es el respaldo para certificados de quien firma.",
    secciones: [
      {
        titulo: "Adelantos de nómina",
        parrafo:
          "Todas las solicitudes de adelanto de nómina te llegan automáticamente. Las decides desde la Bandeja de aprobación, igual que un líder de área: Ver solicitud, Aprobar o Rechazar con motivo obligatorio. Para ver la Bandeja necesitas tener también el rol de Líder de área.",
      },
      {
        titulo: "Tu propio adelanto",
        parrafo:
          "Si tú radicas un adelanto, no puedes aprobarlo tú mismo: el sistema lo envía a otro Líder de Talento Humano.",
      },
      {
        titulo: "Respaldo de certificados laborales",
        parrafo:
          "Si la persona que firma los certificados pide el suyo, la solicitud te llega a ti: la apruebas y el certificado sale con tu firma. Talento Humano debe tener configurada tu firma, cargo y teléfono.",
      },
      {
        titulo: "Un solo Líder General",
        parrafo:
          "Solo puede haber un Líder General. Talento Humano lo asigna desde Configuración; para cambiarlo hay que quitarle el rol a la persona actual primero.",
      },
    ],
  },
};
