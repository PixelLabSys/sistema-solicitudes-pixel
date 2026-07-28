"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";

async function requireLiderTh() {
  const colaborador = await getColaboradorActual();
  if (!colaborador?.es_lider_th) {
    throw new Error("Solo el Líder de Talento Humano puede hacer esto.");
  }
  return colaborador;
}

export async function crearColaborador(formData: FormData) {
  await requireLiderTh();
  const supabase = await createClient();

  const nombre_completo = String(formData.get("nombre_completo") || "").trim();
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const cc = String(formData.get("cc") || "").trim();

  if (!nombre_completo || !correo || !cc) {
    return { error: "Todos los campos son obligatorios." };
  }

  const { error } = await supabase.from("colaborador").insert({
    nombre_completo,
    correo,
    cc,
  });

  if (error) {
    return { error: error.message.includes("duplicate") ? "Ese correo ya está registrado." : error.message };
  }

  revalidatePath("/configuracion");
  return { error: null };
}

export async function importarColaboradores(
  filas: { nombre_completo: string; correo: string; cc: string }[]
) {
  await requireLiderTh();
  const supabase = await createClient();

  let creados = 0;
  const saltados: { correo: string; motivo: string }[] = [];

  for (const fila of filas) {
    const nombre_completo = fila.nombre_completo?.trim();
    const correo = fila.correo?.trim().toLowerCase();
    const cc = fila.cc?.trim();

    if (!nombre_completo || !correo || !cc) {
      saltados.push({ correo: correo || "(sin correo)", motivo: "Faltan datos obligatorios." });
      continue;
    }

    const { error } = await supabase.from("colaborador").insert({ nombre_completo, correo, cc });

    if (error) {
      saltados.push({
        correo,
        motivo: error.message.includes("duplicate") ? "Ese correo ya está registrado." : error.message,
      });
      continue;
    }

    creados++;
  }

  revalidatePath("/configuracion");
  return { creados, saltados };
}

export async function actualizarRoles(
  colaboradorId: string,
  cambios: { es_lider_area?: boolean; es_lider_th?: boolean }
) {
  await requireLiderTh();
  const supabase = await createClient();

  if (cambios.es_lider_area === false) {
    const { count } = await supabase
      .from("solicitud")
      .select("id", { count: "exact", head: true })
      .eq("lider_aprobador_id", colaboradorId)
      .eq("estado", "pendiente");

    if (count && count > 0) {
      return {
        error: `No se puede quitar el rol de líder de área: tiene ${count} solicitud(es) pendiente(s) asignada(s).`,
      };
    }
  }

  const { error } = await supabase
    .from("colaborador")
    .update(cambios)
    .eq("id", colaboradorId);

  if (error) {
    return { error: "Solo puede haber un Líder de Talento Humano a la vez." };
  }

  revalidatePath("/configuracion");
  return { error: null };
}

export async function alternarActivo(colaboradorId: string, activo: boolean) {
  await requireLiderTh();
  const supabase = await createClient();

  if (!activo) {
    const { count } = await supabase
      .from("solicitud")
      .select("id", { count: "exact", head: true })
      .eq("lider_aprobador_id", colaboradorId)
      .eq("estado", "pendiente");

    if (count && count > 0) {
      return {
        error: `No se puede desactivar: tiene ${count} solicitud(es) pendiente(s) asignada(s) como líder aprobador.`,
      };
    }
  }

  const { error } = await supabase
    .from("colaborador")
    .update({ activo })
    .eq("id", colaboradorId);

  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { error: null };
}
