"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { notificarNuevaSolicitud } from "@/lib/email/notificaciones";
import type { Colaborador } from "@/lib/types";

export async function crearSolicitudVacaciones(formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const lider_aprobador_id = String(formData.get("lider_aprobador_id") || "");
  const area = String(formData.get("area") || "").trim();
  const cargo_actual = String(formData.get("cargo_actual") || "").trim();
  const tipo_vacaciones = String(formData.get("tipo_vacaciones") || "");
  const dias_compensados_raw = String(formData.get("dias_compensados") || "");
  const fecha_desde = String(formData.get("fecha_desde") || "");
  const fecha_hasta = String(formData.get("fecha_hasta") || "");
  const ingreso_a_laborar = String(formData.get("ingreso_a_laborar") || "");
  const observaciones = String(formData.get("observaciones") || "");
  const firma_path = String(formData.get("firma_path") || "");

  if (
    !lider_aprobador_id ||
    !area ||
    !cargo_actual ||
    !tipo_vacaciones ||
    !fecha_desde ||
    !fecha_hasta ||
    !ingreso_a_laborar
  ) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (lider_aprobador_id === colaborador.id) {
    return { error: "No puedes elegirte a ti mismo como líder de proceso." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  const dias_compensados = tipo_vacaciones === "mixtas" ? Number(dias_compensados_raw) : null;
  if (tipo_vacaciones === "mixtas" && (!dias_compensados || dias_compensados < 1 || dias_compensados > 30)) {
    return { error: "Indica cuántos días quieres compensar (1 a 30)." };
  }

  const diasAnticipacion =
    (new Date(fecha_desde).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const advertencia_45_dias = diasAnticipacion < 45;

  const { data: solicitud, error: errorInsert } = await supabase
    .from("solicitud")
    .insert({
      tipo: "vacaciones",
      colaborador_id: colaborador.id,
      lider_aprobador_id,
      firma_url: firma_path,
    })
    .select()
    .single();

  if (errorInsert || !solicitud) {
    return { error: errorInsert?.message ?? "No se pudo crear la solicitud." };
  }

  const { error: errorDetalle } = await supabase.from("solicitud_vacaciones").insert({
    solicitud_id: solicitud.id,
    area,
    cargo_actual,
    tipo_vacaciones,
    dias_compensados,
    fecha_desde,
    fecha_hasta,
    ingreso_a_laborar,
    observaciones,
    advertencia_45_dias,
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

export async function actualizarSolicitudVacaciones(solicitudId: string, formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const lider_aprobador_id = String(formData.get("lider_aprobador_id") || "");
  const area = String(formData.get("area") || "").trim();
  const cargo_actual = String(formData.get("cargo_actual") || "").trim();
  const tipo_vacaciones = String(formData.get("tipo_vacaciones") || "");
  const dias_compensados_raw = String(formData.get("dias_compensados") || "");
  const fecha_desde = String(formData.get("fecha_desde") || "");
  const fecha_hasta = String(formData.get("fecha_hasta") || "");
  const ingreso_a_laborar = String(formData.get("ingreso_a_laborar") || "");
  const observaciones = String(formData.get("observaciones") || "");
  const firma_path = String(formData.get("firma_path") || "");

  if (
    !lider_aprobador_id ||
    !area ||
    !cargo_actual ||
    !tipo_vacaciones ||
    !fecha_desde ||
    !fecha_hasta ||
    !ingreso_a_laborar
  ) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (lider_aprobador_id === colaborador.id) {
    return { error: "No puedes elegirte a ti mismo como líder de proceso." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  const dias_compensados = tipo_vacaciones === "mixtas" ? Number(dias_compensados_raw) : null;
  if (tipo_vacaciones === "mixtas" && (!dias_compensados || dias_compensados < 1 || dias_compensados > 30)) {
    return { error: "Indica cuántos días quieres compensar (1 a 30)." };
  }

  const diasAnticipacion =
    (new Date(fecha_desde).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const advertencia_45_dias = diasAnticipacion < 45;

  const { error: errorUpdate } = await supabase
    .from("solicitud")
    .update({ lider_aprobador_id, firma_url: firma_path })
    .eq("id", solicitudId)
    .eq("colaborador_id", colaborador.id);

  if (errorUpdate) {
    return { error: errorUpdate.message };
  }

  const { error: errorDetalle } = await supabase
    .from("solicitud_vacaciones")
    .update({
      area,
      cargo_actual,
      tipo_vacaciones,
      dias_compensados,
      fecha_desde,
      fecha_hasta,
      ingreso_a_laborar,
      observaciones,
      advertencia_45_dias,
    })
    .eq("solicitud_id", solicitudId);

  if (errorDetalle) {
    return { error: errorDetalle.message };
  }

  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitudId,
    evento: "editada",
    actor_id: colaborador.id,
  });

  revalidatePath("/");
  redirect("/");
}
