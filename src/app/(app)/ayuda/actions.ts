"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { VERSION_ACTUAL } from "@/lib/ayuda/novedades";

export async function marcarAyudaVista() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("fn_marcar_ayuda_vista", { p_version: VERSION_ACTUAL });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { error: null };
}
