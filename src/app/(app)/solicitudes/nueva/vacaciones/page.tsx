import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador } from "@/lib/types";
import { VacacionesForm } from "./vacaciones-form";

export default async function NuevaSolicitudVacacionesPage() {
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
        <p style={{ fontSize: 16, fontWeight: 600 }}>Solicitud de vacaciones</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          Recuerda radicar con 45 días de anticipación a la fecha de descanso.
        </p>
      </div>
      <div className="card">
        <VacacionesForm
          lideres={(lideres ?? []) as Colaborador[]}
          colaborador={colaborador!}
        />
      </div>
    </div>
  );
}
