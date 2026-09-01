import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Cargo } from "@/lib/types";
import { NominaForm } from "./nomina-form";

export default async function NuevaSolicitudNominaPage() {
  const colaborador = await getColaboradorActual();
  const supabase = await createClient();

  const [{ count: liderGeneralCount }, { data: cargos }] = await Promise.all([
    supabase
      .from("colaborador")
      .select("id", { count: "exact", head: true })
      .eq("es_lider_general", true)
      .eq("activo", true),
    supabase.from("cargo").select("*").eq("activo", true).order("nombre"),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Solicitud de adelanto de nómina</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          El sistema solo registra la solicitud; el pago lo gestiona Talento
          Humano por fuera del sistema.
        </p>
      </div>
      <div className="card">
        <NominaForm
          hayLiderGeneral={(liderGeneralCount ?? 0) > 0}
          cargos={((cargos ?? []) as Cargo[]).map((c) => c.nombre)}
          colaborador={colaborador!}
        />
      </div>
    </div>
  );
}
