"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { notificarNuevaSolicitud } from "@/lib/email/notificaciones";
import type { Colaborador } from "@/lib/types";

async function resolverAprobador(
  supabase: Awaited<ReturnType<typeof createClient>>,
  colaboradorId: string
): Promise<{ aprobadorId: string } | { error: string }> {
  const { data: config } = await supabase.from("certificado_config").select("firmante_id").maybeSingle();

  if (!config?.firmante_id) {
    return { error: "Talento Humano aún no ha definido quién firma los certificados." };
  }

  const { data: firmante } = await supabase
    .from("colaborador")
    .select("id")
    .eq("id", config.firmante_id)
    .eq("activo", true)
    .maybeSingle();

  if (!firmante) {
    return { error: "La persona que firma los certificados está inactiva. Contacta a Talento Humano." };
  }

  if (firmante.id !== colaboradorId) return { aprobadorId: firmante.id };

  // Quien firma está pidiendo su propio certificado: no puede autoaprobarse.
  const { data: liderGeneral } = await supabase
    .from("colaborador")
    .select("id")
    .eq("es_lider_general", true)
    .eq("activo", true)
    .neq("id", colaboradorId)
    .maybeSingle();

  if (!liderGeneral) {
    return { error: "No hay un Líder General distinto a ti para aprobar tu certificado." };
  }
  return { aprobadorId: liderGeneral.id };
}

export async function crearSolicitudCertificado(formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const destinatario = String(formData.get("destinatario") || "").trim();
  const motivo = String(formData.get("motivo") || "").trim();
  const incluir_salario = formData.get("incluir_salario") === "on";

  if (!destinatario || !motivo) {
    return { error: "El destinatario y el motivo son obligatorios." };
  }
  if (destinatario.length > 150) {
    return { error: "El destinatario no puede superar 150 caracteres." };
  }
  if (motivo.length > 500) {
    return { error: "El motivo no puede superar 500 caracteres." };
  }

  const { data: contrato } = await supabase
    .from("colaborador_contrato")
    .select("rol")
    .eq("colaborador_id", colaborador.id)
    .maybeSingle();

  const rol = contrato?.rol?.trim();
  if (!colaborador.genero || !contrato || !rol) {
    return { error: "Talento Humano aún no ha cargado tus datos laborales. No se puede radicar todavía." };
  }

  const resuelto = await resolverAprobador(supabase, colaborador.id);
  if ("error" in resuelto) return { error: resuelto.error };

  const { data: solicitud, error: errorInsert } = await supabase
    .from("solicitud")
    .insert({
      tipo: "certificado",
      colaborador_id: colaborador.id,
      lider_aprobador_id: resuelto.aprobadorId,
    })
    .select()
    .single();

  if (errorInsert || !solicitud) {
    return { error: errorInsert?.message ?? "No se pudo crear la solicitud." };
  }

  const { error: errorDetalle } = await supabase.from("solicitud_certificado").insert({
    solicitud_id: solicitud.id,
    destinatario,
    cargo: rol,
    motivo,
    incluir_salario,
  });

  if (errorDetalle) {
    await supabase.from("solicitud").update({ estado: "cancelada" }).eq("id", solicitud.id);
    return { error: errorDetalle.message };
  }

  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitud.id,
    evento: "creada",
    actor_id: colaborador.id,
  });

  const { data: aprobador } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", resuelto.aprobadorId)
    .single();

  if (aprobador) {
    await notificarNuevaSolicitud(supabase, solicitud, colaborador as Colaborador, aprobador as Colaborador);
  }

  redirect("/?creada=" + solicitud.consecutivo);
}
