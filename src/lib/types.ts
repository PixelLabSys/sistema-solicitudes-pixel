export type Colaborador = {
  id: string;
  auth_user_id: string | null;
  nombre_completo: string;
  correo: string;
  cc: string;
  es_lider_area: boolean;
  es_lider_th: boolean;
  activo: boolean;
  creado_en: string;
};

export type TipoSolicitud = "permiso" | "vacaciones" | "nomina";
export type EstadoSolicitud = "pendiente" | "aprobada" | "rechazada" | "cancelada";

export type Solicitud = {
  id: string;
  tipo: TipoSolicitud;
  consecutivo: string;
  colaborador_id: string;
  lider_aprobador_id: string;
  estado: EstadoSolicitud;
  motivo_rechazo: string | null;
  firma_url: string | null;
  pdf_url: string | null;
  creado_en: string;
  decidido_en: string | null;
};

export type SolicitudPermisoDetalle = {
  solicitud_id: string;
  area: string | null;
  cargo_actual: string | null;
  fecha_desde: string;
  fecha_hasta: string;
  hora_desde: string;
  hora_hasta: string;
  dias_concedidos: number;
  horas_concedidas: number;
  tipo_permiso: "medico" | "personal";
  descripcion: string | null;
  soporte_url: string | null;
};

export type SolicitudVacacionesDetalle = {
  solicitud_id: string;
  area: string;
  cargo_actual: string;
  tipo_vacaciones: "compensadas" | "disfrutadas" | "mixtas";
  dias_compensados: number | null;
  fecha_desde: string;
  fecha_hasta: string;
  ingreso_a_laborar: string;
  observaciones: string | null;
  advertencia_45_dias: boolean;
};

export type Area = {
  id: string;
  nombre: string;
  activo: boolean;
  creado_en: string;
};

export type Cargo = {
  id: string;
  nombre: string;
  activo: boolean;
  creado_en: string;
};

export type SolicitudNominaDetalle = {
  solicitud_id: string;
  cargo: string;
  tipo_adelanto: "nomina" | "prima" | "cuenta_cobro";
  valor_neto: number;
  transferencia_bancaria: boolean;
};
