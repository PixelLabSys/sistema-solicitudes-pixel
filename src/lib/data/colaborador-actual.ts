import { createClient } from "@/lib/supabase/server";
import type { Colaborador } from "@/lib/types";

export async function getColaboradorActual(): Promise<Colaborador | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("colaborador")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data as Colaborador | null;
}
