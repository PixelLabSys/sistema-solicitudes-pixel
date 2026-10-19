import type { createClient } from "@/lib/supabase/server";
import type { Colaborador, Solicitud, SolicitudCertificadoDetalle, TipoContrato } from "@/lib/types";
import { generarPdfCertificado } from "./generar-pdf-certificado";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function construirPdfCertificado(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  vistaPrevia: boolean
): Promise<{ pdf: Uint8Array } | { error: string }> {
  const [{ data: colaborador }, { data: detalle }, { data: filasDatos }, { data: config }, { data: firmaConfig }] =
    await Promise.all([
    supabase.from("colaborador").select("*").eq("id", solicitud.colaborador_id).single(),
    supabase.from("solicitud_certificado").select("*").eq("solicitud_id", solicitud.id).single(),
    supabase.rpc("fn_datos_certificado", { p_solicitud_id: solicitud.id }),
    supabase.from("certificado_config").select("*").maybeSingle(),
    supabase.from("certificado_firma").select("firma_path").maybeSingle(),
  ]);

  if (!colaborador) return { error: "No se encontró el colaborador solicitante." };
  if (!detalle) return { error: "No se encontró el detalle de la solicitud." };

  const datos = (filasDatos as { fecha_ingreso: string; tipo_contrato: TipoContrato; salario: number | null }[] | null)?.[0];
  if (!datos) {
    return { error: "No se pudieron leer los datos laborales del colaborador. Verifica que Talento Humano los haya cargado." };
  }

  if (!config?.firmante_id || !config.firmante_cargo || !config.firmante_telefono || !firmaConfig?.firma_path) {
    return { error: "Falta configurar la firma, el cargo y el teléfono de quien firma los certificados (Configuración)." };
  }

  const { data: firmante } = await supabase
    .from("colaborador")
    .select("nombre_completo")
    .eq("id", config.firmante_id)
    .single();
  if (!firmante) return { error: "No se encontró a la persona que firma los certificados." };

  const { data: firmaBlob, error: errorFirma } = await supabase.storage.from("firmas").download(firmaConfig.firma_path);
  if (errorFirma || !firmaBlob) {
    return { error: "No se pudo leer la firma del certificado: " + (errorFirma?.message ?? "desconocido") };
  }

  const pdf = await generarPdfCertificado({
    colaborador: colaborador as Colaborador,
    detalle: detalle as SolicitudCertificadoDetalle,
    datosLaborales: { ...datos, salario: datos.salario != null ? Number(datos.salario) : null },
    firmante: {
      nombre: firmante.nombre_completo,
      cargo: config.firmante_cargo,
      telefono: config.firmante_telefono,
    },
    firmaBytes: new Uint8Array(await firmaBlob.arrayBuffer()),
    fechaEntrega: new Date(),
    vistaPrevia,
  });

  return { pdf };
}
