import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type {
  Area,
  Cargo,
  Colaborador,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
} from "@/lib/types";
import { PermisoForm } from "../../nueva/permiso/permiso-form";
import { VacacionesForm } from "../../nueva/vacaciones/vacaciones-form";
import { NominaForm } from "../../nueva/nomina/nomina-form";

const TITULOS = {
  permiso: "Editar solicitud de permiso",
  vacaciones: "Editar solicitud de vacaciones",
  nomina: "Editar solicitud de adelanto de nómina",
};

export default async function EditarSolicitudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const colaborador = await getColaboradorActual();
  const supabase = await createClient();

  const { data: solicitud } = await supabase
    .from("solicitud")
    .select("*")
    .eq("id", id)
    .eq("colaborador_id", colaborador?.id ?? "")
    .eq("estado", "pendiente")
    .single();

  if (!solicitud) {
    notFound();
  }

  const s = solicitud as Solicitud;

  const [{ data: lideres }, { data: areas }, { data: cargos }] = await Promise.all([
    supabase
      .from("colaborador")
      .select("*")
      .eq("es_lider_area", true)
      .eq("activo", true)
      .neq("id", colaborador?.id ?? ""),
    supabase.from("area").select("*").eq("activo", true).order("nombre"),
    supabase.from("cargo").select("*").eq("activo", true).order("nombre"),
  ]);

  const tablaDetalle =
    s.tipo === "permiso" ? "solicitud_permiso" : s.tipo === "vacaciones" ? "solicitud_vacaciones" : "solicitud_nomina";

  const { data: detalle } = await supabase.from(tablaDetalle).select("*").eq("solicitud_id", s.id).single();

  const edicionBase = {
    solicitudId: s.id,
    liderActualId: s.lider_aprobador_id,
    firmaExistente: s.firma_url ?? "",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>{TITULOS[s.tipo]}</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          {s.consecutivo} · Solo puedes editar mientras esté Pendiente.
        </p>
      </div>
      <div className="card">
        {s.tipo === "permiso" && (
          <PermisoForm
            lideres={(lideres ?? []) as Colaborador[]}
            colaborador={colaborador!}
            areas={((areas ?? []) as Area[]).map((a) => a.nombre)}
            cargos={((cargos ?? []) as Cargo[]).map((c) => c.nombre)}
            edicion={{ ...edicionBase, detalle: detalle as SolicitudPermisoDetalle }}
          />
        )}
        {s.tipo === "vacaciones" && (
          <VacacionesForm
            lideres={(lideres ?? []) as Colaborador[]}
            areas={((areas ?? []) as Area[]).map((a) => a.nombre)}
            cargos={((cargos ?? []) as Cargo[]).map((c) => c.nombre)}
            colaborador={colaborador!}
            edicion={{ ...edicionBase, detalle: detalle as SolicitudVacacionesDetalle }}
          />
        )}
        {s.tipo === "nomina" && (
          <NominaForm
            lideres={(lideres ?? []) as Colaborador[]}
            cargos={((cargos ?? []) as Cargo[]).map((c) => c.nombre)}
            colaborador={colaborador!}
            edicion={{ ...edicionBase, detalle: detalle as SolicitudNominaDetalle }}
          />
        )}
      </div>
    </div>
  );
}
