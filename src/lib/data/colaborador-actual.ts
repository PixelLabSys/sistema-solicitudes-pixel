import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Colaborador } from "@/lib/types";

export type ColaboradorConAvatar = Colaborador & { avatar_url: string | null };

// cache() memoiza esto por request: layout.tsx y cada page.tsx lo llaman por
// separado, y sin esto cada llamada repetía un round-trip a Supabase Auth
// (getUser) más una consulta a `colaborador`.
export const getColaboradorActual = cache(async (): Promise<ColaboradorConAvatar | null> => {
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

  if (!data) return null;

  const avatar_url =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  return { ...data, avatar_url } as ColaboradorConAvatar;
});
