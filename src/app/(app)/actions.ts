"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";

export async function cancelarSolicitud(solicitudId: string) {
  const colaborador = await getColaboradorActual();
  if (!colaborador) throw new Error("No autenticado.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("solicitud")
    .update({ estado: "cancelada" })
    .eq("id", solicitudId)
    .eq("colaborador_id", colaborador.id);

  if (error) return { error: error.message };

  await supabase.from("solicitud_evento").insert({
    solicitud_id: solicitudId,
    evento: "cancelada",
    actor_id: colaborador.id,
  });

  revalidatePath("/");
  return { error: null };
}
