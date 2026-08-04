import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Cargo, Colaborador } from "@/lib/types";
import { NominaForm } from "./nomina-form";

export default async function NuevaSolicitudNominaPage() {
  const colaborador = await getColaboradorActual();
  const supabase = await createClient();

  const [{ data: lideres }, { data: cargos }] = await Promise.all([
    supabase
      .from("colaborador")
      .select("*")
      .eq("es_lider_area", true)
      .eq("activo", true)
      .neq("id", colaborador?.id ?? ""),
    supabase.from("cargo").select("*").eq("activo", true).order("nombre"),
  ]);

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
          cargos={((cargos ?? []) as Cargo[]).map((c) => c.nombre)}
          colaborador={colaborador!}
        />
      </div>
    </div>
  );
}
