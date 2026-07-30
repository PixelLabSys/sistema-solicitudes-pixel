import { resend, REMITENTE } from "./resend";
import { plantillaCorreo } from "./plantilla";
import type { createClient } from "@/lib/supabase/server";
import type { Colaborador, Solicitud } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const TIPO_LABEL: Record<Solicitud["tipo"], string> = {
  permiso: "Permiso",
  vacaciones: "Vacaciones",
  nomina: "Adelanto de Nómina",
};

async function registrarEvento(
  supabase: SupabaseServerClient,
  solicitudId: string,
  evento: "email_fallido" | "notificada_th"
) {
  await supabase.from("solicitud_evento").insert({ solicitud_id: solicitudId, evento });
}

export async function notificarNuevaSolicitud(
  supabase: SupabaseServerClient,
  solicitud: Solicitud,
  colaborador: Colaborador,
  lider: Colaborador
) {
  try {
    const html = plantillaCorreo({
      eyebrow: `${TIPO_LABEL[solicitud.tipo]} · ${solicitud.consecutivo}`,
      titulo: "Tienes una solicitud pendiente de aprobación",
      parrafosHtml: `
        <p style="margin:0 0 12px 0;"><strong style="color:#0b1b29;">${colaborador.nombre_completo}</strong> radicó una solicitud de ${TIPO_LABEL[solicitud.tipo]} y te eligió como líder de proceso.</p>
        <p style="margin:0;">Ingresa para revisarla y aprobarla o rechazarla.</p>
      `,
      ctaTexto: "Revisar solicitud",
    });

    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: lider.correo,
      subject: `Nueva solicitud pendiente: ${solicitud.consecutivo}`,
      html,
    });
    if (error) await registrarEvento(supabase, solicitud.id, "email_fallido");
  } catch {
    await registrarEvento(supabase, solicitud.id, "email_fallido");
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
    const aprobada = estadoFinal === "aprobada";
    const html = plantillaCorreo({
      eyebrow: `${TIPO_LABEL[solicitud.tipo]} · ${solicitud.consecutivo}`,
      titulo: aprobada ? "Tu solicitud fue aprobada" : "Tu solicitud fue rechazada",
      colorEyebrow: aprobada ? "#3fb950" : "#f85149",
      parrafosHtml: `
        <p style="margin:0 0 12px 0;">Tu solicitud de ${TIPO_LABEL[solicitud.tipo]} <strong style="color:#0b1b29;">${solicitud.consecutivo}</strong> fue ${estadoFinal}.</p>
        ${
          !aprobada && motivo
            ? `<p style="margin:0 0 12px 0; padding:12px 14px; background:#fef2f2; border-radius:8px; color:#991b1b;">Motivo: ${motivo}</p>`
            : ""
        }
        <p style="margin:0;">Ingresa para ver el detalle y descargar el PDF.</p>
      `,
      ctaTexto: "Ver mi solicitud",
    });

    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: colaborador.correo,
      subject: `Tu solicitud ${solicitud.consecutivo} fue ${estadoFinal}`,
      html,
    });
    if (error) await registrarEvento(supabase, solicitud.id, "email_fallido");
  } catch {
    await registrarEvento(supabase, solicitud.id, "email_fallido");
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
    const html = plantillaCorreo({
      eyebrow: `${TIPO_LABEL[solicitud.tipo]} · ${solicitud.consecutivo}`,
      titulo: "Solicitud aprobada",
      colorEyebrow: "#3fb950",
      parrafosHtml: `
        <p style="margin:0 0 12px 0;"><strong style="color:#0b1b29;">${colaborador.nombre_completo}</strong> tuvo su solicitud de ${TIPO_LABEL[solicitud.tipo]} aprobada.</p>
        <p style="margin:0;">Ya está visible en el Dashboard de historial.</p>
      `,
      ctaTexto: "Ver Dashboard",
    });

    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: (lideresTh as Colaborador[]).map((l) => l.correo),
      subject: `Solicitud aprobada: ${solicitud.consecutivo}`,
      html,
    });

    if (error) {
      await registrarEvento(supabase, solicitud.id, "email_fallido");
    } else {
      await registrarEvento(supabase, solicitud.id, "notificada_th");
    }
  } catch {
    await registrarEvento(supabase, solicitud.id, "email_fallido");
  }
}
