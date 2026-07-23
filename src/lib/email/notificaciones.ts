import { resend, REMITENTE } from "./resend";
import type { createClient } from "@/lib/supabase/server";
import type { Colaborador, Solicitud } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const TIPO_LABEL: Record<Solicitud["tipo"], string> = {
  permiso: "Permiso",
  vacaciones: "Vacaciones",
  nomina: "Adelanto de Nómina",
};

async function registrarFallo(supabase: SupabaseServerClient, solicitudId: string) {
  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitudId,
    evento: "email_fallido",
  });
}

export async function notificarNuevaSolicitud(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  colaborador: Colaborador,
  lider: Colaborador
) {
  try {
    await resend.emails.send({
      from: REMITENTE,
      to: lider.correo,
      subject: `Nueva solicitud pendiente: ${solicitud.consecutivo}`,
      html: `
        <h2>Tienes una solicitud pendiente de aprobación</h2>
        <p><strong>${colaborador.nombre_completo}</strong> radicó una solicitud de ${TIPO_LABEL[solicitud.tipo]} (${solicitud.consecutivo}) y te eligió como líder de proceso.</p>
        <p>Ingresa al Sistema de Solicitudes para revisarla y aprobarla o rechazarla.</p>
      `,
    });
  } catch {
    await registrarFallo(supabase, solicitud.id);
  }
}

export async function notificarDecision(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  colaborador: Colaborador,
  estadoFinal: "aprobada" | "rechazada",
  motivo?: string
) {
  try {
    await resend.emails.send({
      from: REMITENTE,
      to: colaborador.correo,
      subject: `Tu solicitud ${solicitud.consecutivo} fue ${estadoFinal}`,
      html: `
        <h2>Tu solicitud de ${TIPO_LABEL[solicitud.tipo]} fue ${estadoFinal}</h2>
        <p>Consecutivo: <strong>${solicitud.consecutivo}</strong></p>
        ${estadoFinal === "rechazada" && motivo ? `<p>Motivo: ${motivo}</p>` : ""}
        <p>Ingresa al Sistema de Solicitudes para ver el detalle y descargar el PDF.</p>
      `,
    });
  } catch {
    await registrarFallo(supabase, solicitud.id);
  }
}

export async function notificarLiderTH(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  colaborador: Colaborador
) {
  const { data: lideresTh } = await supabase
    .from("colaborador")
    .select("*")
    .eq("es_lider_th", true)
    .eq("activo", true);

  if (!lideresTh || lideresTh.length === 0) return;

  try {
    await resend.emails.send({
      from: REMITENTE,
      to: (lideresTh as Colaborador[]).map((l) => l.correo),
      subject: `Solicitud aprobada: ${solicitud.consecutivo}`,
      html: `
        <h2>Solicitud aprobada</h2>
        <p><strong>${colaborador.nombre_completo}</strong> tuvo su solicitud de ${TIPO_LABEL[solicitud.tipo]} (${solicitud.consecutivo}) aprobada.</p>
        <p>Ya está visible en el Dashboard de historial.</p>
      `,
    });

    await supabase.from("solicitud_evento").insert({
      solicitud_id: solicitud.id,
      evento: "notificada_th",
    });
  } catch {
    await registrarFallo(supabase, solicitud.id);
  }
}
