import type { createClient } from "@/lib/supabase/server";
import type {
  CertificadoFirmante,
  Colaborador,
  Solicitud,
  SolicitudCertificadoDetalle,
  TipoContrato,
} from "@/lib/types";
import { generarPdfCertificado } from "./generar-pdf-certificado";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type DatosCertificado = {
  fecha_ingreso: string;
  tipo_contrato: TipoContrato;
  salario: number | null;
  rol: string | null;
};

// En cada certificado firma quien lo aprueba: normalmente la persona definida como
// firmante principal y, cuando ella misma lo pide, el Líder General.
export async function construirPdfCertificado(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  vistaPrevia: boolean
): Promise<{ pdf: Uint8Array } | { error: string }> {
  const [{ data: colaborador }, { data: detalle }, { data: filasDatos }, { data: aprobador }, { data: firmante }] =
    await Promise.all([
      supabase.from("colaborador").select("*").eq("id", solicitud.colaborador_id).single(),
      supabase.from("solicitud_certificado").select("*").eq("solicitud_id", solicitud.id).single(),
      supabase.rpc("fn_datos_certificado", { p_solicitud_id: solicitud.id }),
      supabase.from("colaborador").select("nombre_completo").eq("id", solicitud.lider_aprobador_id).single(),
      supabase.from("certificado_firmante").select("*").eq("colaborador_id", solicitud.lider_aprobador_id).maybeSingle(),
    ]);

  if (!colaborador) return { error: "No se encontró el colaborador solicitante." };
  if (!detalle) return { error: "No se encontró el detalle de la solicitud." };
  if (!aprobador) return { error: "No se encontró a quien debe aprobar y firmar el certificado." };

  const datos = (filasDatos as DatosCertificado[] | null)?.[0];
  if (!datos) {
    return { error: "No se pudieron leer los datos laborales del colaborador. Verifica que Talento Humano los haya cargado." };
  }
  if (!datos.rol?.trim()) {
    return { error: "Talento Humano aún no ha configurado el rol del colaborador para el certificado (Configuración)." };
  }

  if (!firmante) {
    return {
      error: `Falta configurar la firma, el cargo y el teléfono de ${aprobador.nombre_completo} para los certificados (Configuración).`,
    };
  }

  const { firma_path, cargo, telefono } = firmante as CertificadoFirmante;
  const { data: firmaBlob, error: errorFirma } = await supabase.storage.from("firmas").download(firma_path);
  if (errorFirma || !firmaBlob) {
    return { error: "No se pudo leer la firma del certificado: " + (errorFirma?.message ?? "desconocido") };
  }

  const pdf = await generarPdfCertificado({
    colaborador: colaborador as Colaborador,
    detalle: { ...(detalle as SolicitudCertificadoDetalle), cargo: datos.rol.trim() },
    datosLaborales: {
      fecha_ingreso: datos.fecha_ingreso,
      tipo_contrato: datos.tipo_contrato,
      salario: datos.salario != null ? Number(datos.salario) : null,
    },
    firmante: { nombre: aprobador.nombre_completo, cargo, telefono },
    firmaBytes: new Uint8Array(await firmaBlob.arrayBuffer()),
    fechaEntrega: new Date(),
    vistaPrevia,
  });

  return { pdf };
}
