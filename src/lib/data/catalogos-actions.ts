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

// Crear un área o cargo nuevo lo puede hacer cualquier colaborador
// autenticado (conveniencia desde el mismo formulario de solicitud).
export async function crearArea(nombre: string) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) return { error: "No autenticado." };

  const supabase = await createClient();
  const { error } = await supabase.from("area").insert({ nombre: nombre.trim() });

  if (error) {
    return { error: error.message.includes("duplicate") ? "Esa área ya existe." : error.message };
  }
  revalidatePath("/configuracion");
  return { error: null };
}

export async function crearCargo(nombre: string) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) return { error: "No autenticado." };

  const supabase = await createClient();
  const { error } = await supabase.from("cargo").insert({ nombre: nombre.trim() });

  if (error) {
    return { error: error.message.includes("duplicate") ? "Ese cargo ya existe." : error.message };
  }
  revalidatePath("/configuracion");
  return { error: null };
}

// Editar (renombrar) y desactivar son exclusivos del Líder de TH.
export async function editarArea(id: string, nombre: string) {
  await requireLiderTh();
  const supabase = await createClient();
  const { error } = await supabase.from("area").update({ nombre: nombre.trim() }).eq("id", id);
  if (error) return { error: error.message.includes("duplicate") ? "Ya existe un área con ese nombre." : error.message };
  revalidatePath("/configuracion");
  return { error: null };
}

export async function alternarAreaActivo(id: string, activo: boolean) {
  await requireLiderTh();
  const supabase = await createClient();
  const { error } = await supabase.from("area").update({ activo }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  return { error: null };
}

export async function editarCargo(id: string, nombre: string) {
  await requireLiderTh();
  const supabase = await createClient();
  const { error } = await supabase.from("cargo").update({ nombre: nombre.trim() }).eq("id", id);
  if (error) return { error: error.message.includes("duplicate") ? "Ya existe un cargo con ese nombre." : error.message };
  revalidatePath("/configuracion");
  return { error: null };
}

export async function alternarCargoActivo(id: string, activo: boolean) {
  await requireLiderTh();
  const supabase = await createClient();
  const { error } = await supabase.from("cargo").update({ activo }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  return { error: null };
}
