"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { notificarNuevaSolicitud } from "@/lib/email/notificaciones";
import type { Colaborador } from "@/lib/types";

export async function crearSolicitudNomina(formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const lider_aprobador_id = String(formData.get("lider_aprobador_id") || "");
  const cargo = String(formData.get("cargo") || "").trim();
  const tipo_adelanto = String(formData.get("tipo_adelanto") || "");
  const valor_neto = Number(formData.get("valor_neto") || 0);
  const transferencia_bancaria = formData.get("transferencia_bancaria") === "on";
  const firma_path = String(formData.get("firma_path") || "");

  if (!lider_aprobador_id || !cargo || !tipo_adelanto || !valor_neto) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (lider_aprobador_id === colaborador.id) {
    return { error: "No puedes elegirte a ti mismo como líder de proceso." };
  }
  if (valor_neto <= 0) {
    return { error: "El valor neto debe ser mayor a cero." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  const { data: solicitud, error: errorInsert } = await supabase
    .from("solicitud")
    .insert({
      tipo: "nomina",
      colaborador_id: colaborador.id,
      lider_aprobador_id,
      firma_url: firma_path,
    })
    .select()
    .single();

  if (errorInsert || !solicitud) {
    return { error: errorInsert?.message ?? "No se pudo crear la solicitud." };
  }

  const { error: errorDetalle } = await supabase.from("solicitud_nomina").insert({
    solicitud_id: solicitud.id,
    cargo,
    tipo_adelanto,
    valor_neto,
    transferencia_bancaria,
  });

  if (errorDetalle) {
    return { error: errorDetalle.message };
  }

  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitud.id,
    evento: "creada",
    actor_id: colaborador.id,
  });

  const { data: lider } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", lider_aprobador_id)
    .single();

  if (lider) {
    await notificarNuevaSolicitud(supabase, solicitud, colaborador as Colaborador, lider as Colaborador);
  }

  redirect("/?creada=" + solicitud.consecutivo);
}
