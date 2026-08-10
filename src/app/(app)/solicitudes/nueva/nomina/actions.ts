"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { notificarNuevaSolicitud } from "@/lib/email/notificaciones";
import type { Colaborador } from "@/lib/types";

async function resolverLiderAdelanto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  colaboradorId: string
): Promise<{ liderId: string } | { error: string }> {
  const { data: liderGeneral } = await supabase
    .from("colaborador")
    .select("*")
    .eq("es_lider_general", true)
    .eq("activo", true)
    .maybeSingle();

  if (!liderGeneral) {
    return { error: "No hay un Líder General configurado. Contacta a Talento Humano." };
  }

  if (liderGeneral.id !== colaboradorId) {
    return { liderId: liderGeneral.id };
  }

  // El propio Líder General está radicando: no puede autoaprobarse,
  // así que se enruta a un Líder de TH distinto como respaldo.
  const { data: th } = await supabase
    .from("colaborador")
    .select("*")
    .eq("es_lider_th", true)
    .eq("activo", true)
    .neq("id", colaboradorId)
    .limit(1)
    .maybeSingle();

  if (!th) {
    return {
      error: "Eres el Líder General y no hay otro Líder de TH configurado para aprobar tu propia solicitud.",
    };
  }

  return { liderId: th.id };
}

export async function crearSolicitudNomina(formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const cargo = String(formData.get("cargo") || "").trim();
  const tipo_adelanto = String(formData.get("tipo_adelanto") || "");
  const valor_neto = Number(formData.get("valor_neto") || 0);
  const transferencia_bancaria = formData.get("transferencia_bancaria") === "on";
  const firma_path = String(formData.get("firma_path") || "");

  if (!cargo || !tipo_adelanto || !valor_neto) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (valor_neto <= 0) {
    return { error: "El valor neto debe ser mayor a cero." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  const resuelto = await resolverLiderAdelanto(supabase, colaborador.id);
  if ("error" in resuelto) {
    return { error: resuelto.error };
  }
  const lider_aprobador_id = resuelto.liderId;

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

export async function actualizarSolicitudNomina(solicitudId: string, formData: FormData) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();

  const cargo = String(formData.get("cargo") || "").trim();
  const tipo_adelanto = String(formData.get("tipo_adelanto") || "");
  const valor_neto = Number(formData.get("valor_neto") || 0);
  const transferencia_bancaria = formData.get("transferencia_bancaria") === "on";
  const firma_path = String(formData.get("firma_path") || "");

  if (!cargo || !tipo_adelanto || !valor_neto) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (valor_neto <= 0) {
    return { error: "El valor neto debe ser mayor a cero." };
  }
  if (!firma_path) {
    return { error: "La firma es obligatoria." };
  }

  // El líder de proceso de un Adelanto no es editable: se fijó automáticamente
  // (Líder General) al momento de radicar y se conserva igual al editar.
  const { error: errorUpdate } = await supabase
    .from("solicitud")
    .update({ firma_url: firma_path })
    .eq("id", solicitudId)
    .eq("colaborador_id", colaborador.id);

  if (errorUpdate) {
    return { error: errorUpdate.message };
  }

  const { error: errorDetalle } = await supabase
    .from("solicitud_nomina")
    .update({ cargo, tipo_adelanto, valor_neto, transferencia_bancaria })
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
