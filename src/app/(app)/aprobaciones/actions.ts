"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { generarPdfSolicitud } from "@/lib/pdf/generar-pdf-solicitud";
import { notificarDecision, notificarLiderTH } from "@/lib/email/notificaciones";
import type {
  Colaborador,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
} from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function construirYSubirPdf(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  lider: Colaborador,
  estadoFinal: "aprobada" | "rechazada",
  motivoRechazo?: string
): Promise<{ pdfPath?: string; error?: string }> {
  const { data: colaborador } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", solicitud.colaborador_id)
    .single();

  if (!colaborador) return { error: "No se encontró el colaborador solicitante." };

  const tablaDetalle =
    solicitud.tipo === "permiso"
      ? "solicitud_permiso"
      : solicitud.tipo === "vacaciones"
      ? "solicitud_vacaciones"
      : "solicitud_nomina";

  const { data: detalle } = await supabase
    .from(tablaDetalle)
    .select("*")
    .eq("solicitud_id", solicitud.id)
    .single();

  if (!detalle) return { error: "No se encontró el detalle de la solicitud." };

  if (!solicitud.firma_url) return { error: "La solicitud no tiene firma registrada." };

  const { data: firmaBlob, error: errorFirma } = await supabase.storage
    .from("firmas")
    .download(solicitud.firma_url);

  if (errorFirma || !firmaBlob) {
    return { error: "No se pudo leer la firma: " + (errorFirma?.message ?? "desconocido") };
  }

  const firmaBytes = new Uint8Array(await firmaBlob.arrayBuffer());

  const pdfBytes = await generarPdfSolicitud({
    solicitud,
    colaborador: colaborador as Colaborador,
    lider,
    detalle: detalle as SolicitudPermisoDetalle | SolicitudVacacionesDetalle | SolicitudNominaDetalle,
    estadoFinal,
    motivoRechazo,
    firmaBytes,
  });

  const pdfPath = `${solicitud.id}.pdf`;
  const { error: errorUpload } = await supabase.storage
    .from("pdfs")
    .upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (errorUpload) {
    return { error: "No se pudo guardar el PDF: " + errorUpload.message };
  }

  return { pdfPath };
}

export async function aprobarSolicitud(solicitudId: string) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const { data: solicitud } = await supabase
    .from("solicitud")
    .select("*")
    .eq("id", solicitudId)
    .eq("lider_aprobador_id", colaborador.id)
    .eq("estado", "pendiente")
    .single();

  if (!solicitud) return { error: "Solicitud no encontrada o ya decidida." };

  const { pdfPath, error: errorPdf } = await construirYSubirPdf(
    supabase,
    solicitud as Solicitud,
    colaborador,
    "aprobada"
  );
  if (errorPdf) return { error: errorPdf };

  const { error } = await supabase
    .from("solicitud")
    .update({ estado: "aprobada", pdf_url: pdfPath })
    .eq("id", solicitudId)
    .eq("lider_aprobador_id", colaborador.id);

  if (error) return { error: error.message };

  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitudId,
    evento: "aprobada",
    actor_id: colaborador.id,
  });

  const { data: solicitante } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", solicitud.colaborador_id)
    .single();

  if (solicitante) {
    await notificarDecision(supabase, solicitud as Solicitud, solicitante as Colaborador, "aprobada");
    await notificarLiderTH(supabase, solicitud as Solicitud, solicitante as Colaborador);
  }

  revalidatePath("/aprobaciones");
  return { error: null };
}

export async function rechazarSolicitud(solicitudId: string, motivo: string) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  if (!motivo.trim()) {
    return { error: "El motivo de rechazo es obligatorio." };
  }

  const supabase = await createClient();

  const { data: solicitud } = await supabase
    .from("solicitud")
    .select("*")
    .eq("id", solicitudId)
    .eq("lider_aprobador_id", colaborador.id)
    .eq("estado", "pendiente")
    .single();

  if (!solicitud) return { error: "Solicitud no encontrada o ya decidida." };

  const { pdfPath, error: errorPdf } = await construirYSubirPdf(
    supabase,
    solicitud as Solicitud,
    colaborador,
    "rechazada",
    motivo.trim()
  );
  if (errorPdf) return { error: errorPdf };

  const { error } = await supabase
    .from("solicitud")
    .update({ estado: "rechazada", motivo_rechazo: motivo.trim(), pdf_url: pdfPath })
    .eq("id", solicitudId)
    .eq("lider_aprobador_id", colaborador.id);

  if (error) return { error: error.message };

  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitudId,
    evento: "rechazada",
    actor_id: colaborador.id,
  });

  const { data: solicitante } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", solicitud.colaborador_id)
    .single();

  if (solicitante) {
    await notificarDecision(
      supabase,
      solicitud as Solicitud,
      solicitante as Colaborador,
      "rechazada",
      motivo.trim()
    );
  }

  revalidatePath("/aprobaciones");
  return { error: null };
}
