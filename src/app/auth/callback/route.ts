import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const correo = user?.email?.toLowerCase();
      const { data: autorizado } = await supabase.rpc("fn_correo_autorizado", {
        p_correo: correo ?? "",
      });

      if (!autorizado) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=no_autorizado`);
      }

      await supabase.rpc("fn_vincular_colaborador");
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
}
