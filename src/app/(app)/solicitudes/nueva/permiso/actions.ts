"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { notificarNuevaSolicitud } from "@/lib/email/notificaciones";
import type { Colaborador } from "@/lib/types";

function calcularTiempoConcedido(
  fechaDesde: string,
  fechaHasta: string,
  horaDesde: string,
  horaHasta: string
) {
  if (fechaDesde !== fechaHasta) {
    const dias =
      (new Date(fechaHasta).getTime() - new Date(fechaDesde).getTime()) /
        (1000 * 60 * 60 * 24) +
      1;
    return { dias_concedidos: dias, horas_concedidas: 0 };
  }

  const [h1, m1] = horaDesde.split(":").map(Number);
  const [h2, m2] = horaHasta.split(":").map(Number);
  const horas = (h2 + m2 / 60) - (h1 + m1 / 60);
  return { dias_concedidos: 0, horas_concedidas: Math.round(horas * 100) / 100 };
}

export async function crearSolicitudPermiso(formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const lider_aprobador_id = String(formData.get("lider_aprobador_id") || "");
  const area = String(formData.get("area") || "");
  const cargo_actual = String(formData.get("cargo_actual") || "");
  const fecha_desde = String(formData.get("fecha_desde") || "");
  const fecha_hasta = String(formData.get("fecha_hasta") || "");
  const hora_desde = String(formData.get("hora_desde") || "");
  const hora_hasta = String(formData.get("hora_hasta") || "");
  const tipo_permiso = String(formData.get("tipo_permiso") || "");
  const descripcion = String(formData.get("descripcion") || "");
  const firma_path = String(formData.get("firma_path") || "");
  const soporte_path = String(formData.get("soporte_path") || "") || null;

  if (!lider_aprobador_id || !fecha_desde || !fecha_hasta || !hora_desde || !hora_hasta) {
    return { error: "Todos los campos de fecha, hora y líder son obligatorios." };
  }
  if (!area || !cargo_actual) {
    return { error: "El área y el cargo actual son obligatorios." };
  }
  if (lider_aprobador_id === colaborador.id) {
    return { error: "No puedes elegirte a ti mismo como líder de proceso." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  const { dias_concedidos, horas_concedidas } = calcularTiempoConcedido(
    fecha_desde,
    fecha_hasta,
    hora_desde,
    hora_hasta
  );

  const { data: solicitud, error: errorInsert } = await supabase
    .from("solicitud")
    .insert({
      tipo: "permiso",
      colaborador_id: colaborador.id,
      lider_aprobador_id,
      firma_url: firma_path,
    })
    .select()
    .single();

  if (errorInsert || !solicitud) {
    return { error: errorInsert?.message ?? "No se pudo crear la solicitud." };
  }

  const { error: errorDetalle } = await supabase.from("solicitud_permiso").insert({
    solicitud_id: solicitud.id,
    area,
    cargo_actual,
    fecha_desde,
    fecha_hasta,
    hora_desde,
    hora_hasta,
    dias_concedidos,
    horas_concedidas,
    tipo_permiso,
    descripcion,
    soporte_url: soporte_path,
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

export async function actualizarSolicitudPermiso(solicitudId: string, formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const lider_aprobador_id = String(formData.get("lider_aprobador_id") || "");
  const area = String(formData.get("area") || "");
  const cargo_actual = String(formData.get("cargo_actual") || "");
  const fecha_desde = String(formData.get("fecha_desde") || "");
  const fecha_hasta = String(formData.get("fecha_hasta") || "");
  const hora_desde = String(formData.get("hora_desde") || "");
  const hora_hasta = String(formData.get("hora_hasta") || "");
  const tipo_permiso = String(formData.get("tipo_permiso") || "");
  const descripcion = String(formData.get("descripcion") || "");
  const firma_path = String(formData.get("firma_path") || "");
  const soporte_path = String(formData.get("soporte_path") || "") || null;

  if (!lider_aprobador_id || !fecha_desde || !fecha_hasta || !hora_desde || !hora_hasta) {
    return { error: "Todos los campos de fecha, hora y líder son obligatorios." };
  }
  if (!area || !cargo_actual) {
    return { error: "El área y el cargo actual son obligatorios." };
  }
  if (lider_aprobador_id === colaborador.id) {
    return { error: "No puedes elegirte a ti mismo como líder de proceso." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  const { dias_concedidos, horas_concedidas } = calcularTiempoConcedido(
    fecha_desde,
    fecha_hasta,
    hora_desde,
    hora_hasta
  );

  const { error: errorUpdate } = await supabase
    .from("solicitud")
    .update({ lider_aprobador_id, firma_url: firma_path })
    .eq("id", solicitudId)
    .eq("colaborador_id", colaborador.id);

  if (errorUpdate) {
    return { error: errorUpdate.message };
  }

  const { error: errorDetalle } = await supabase
    .from("solicitud_permiso")
    .update({
      area,
      cargo_actual,
      fecha_desde,
      fecha_hasta,
      hora_desde,
      hora_hasta,
      dias_concedidos,
      horas_concedidas,
      tipo_permiso,
      descripcion,
      ...(soporte_path ? { soporte_url: soporte_path } : {}),
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
