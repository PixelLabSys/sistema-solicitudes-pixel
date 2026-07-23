import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador } from "@/lib/types";
import { NominaForm } from "./nomina-form";

export default async function NuevaSolicitudNominaPage() {
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
        <p style={{ fontSize: 16, fontWeight: 600 }}>Solicitud de adelanto de nómina</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          El sistema solo registra la solicitud; el pago lo gestiona Talento
          Humano por fuera del sistema.
        </p>
      </div>
      <div className="card">
        <NominaForm
          lideres={(lideres ?? []) as Colaborador[]}
          colaborador={colaborador!}
        />
      </div>
    </div>
  );
}
