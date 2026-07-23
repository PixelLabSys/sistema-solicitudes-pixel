import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador } from "@/lib/types";
import { PermisoForm } from "./permiso-form";

export default async function NuevaSolicitudPermisoPage() {
  const colaborador = await getColaboradorActual();
  const supabase = await createClient();

  const { data: lideres } = await supabase
    .from("colaborador")
    .select("*")
    .eq("es_lider_area", true)
    .eq("activo", true)
    .neq("id", colaborador?.id ?? "");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Solicitud de permiso</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          El consecutivo (SP-####) se asigna automáticamente al enviar.
        </p>
      </div>
      <div className="card">
        <PermisoForm
          lideres={(lideres ?? []) as Colaborador[]}
          colaborador={colaborador!}
        />
      </div>
    </div>
  );
}
