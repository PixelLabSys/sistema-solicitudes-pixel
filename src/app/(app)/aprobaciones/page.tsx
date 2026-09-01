import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador, Solicitud } from "@/lib/types";
import { AprobacionRow } from "./aprobacion-row";

const IDS_VACIOS = ["00000000-0000-0000-0000-000000000000"];

export default async function AprobacionesPage() {
  const yo = await getColaboradorActual();
  if (!yo?.es_lider_area) redirect("/");

  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("solicitud")
    .select("*")
    .eq("lider_aprobador_id", yo.id)
    .eq("estado", "pendiente")
    .order("creado_en", { ascending: true });

  const lista = (solicitudes ?? []) as Solicitud[];
  const colaboradorIds = [...new Set(lista.map((s) => s.colaborador_id))];
  const solicitudIds = lista.length ? lista.map((s) => s.id) : IDS_VACIOS;

  const [{ data: colaboradores }, { data: permisos }, { data: vacaciones }, { data: nominas }] =
    await Promise.all([
      supabase.from("colaborador").select("*").in("id", colaboradorIds.length ? colaboradorIds : IDS_VACIOS),
      supabase.from("solicitud_permiso").select("*").in("solicitud_id", solicitudIds),
      supabase.from("solicitud_vacaciones").select("*").in("solicitud_id", solicitudIds),
      supabase.from("solicitud_nomina").select("*").in("solicitud_id", solicitudIds),
    ]);

  const mapaColaboradores = new Map(
    ((colaboradores ?? []) as Colaborador[]).map((c) => [c.id, c])
  );
  const mapaPermisos = new Map((permisos ?? []).map((p) => [p.solicitud_id, p]));
  const mapaVacaciones = new Map((vacaciones ?? []).map((v) => [v.solicitud_id, v]));
  const mapaNominas = new Map((nominas ?? []).map((n) => [n.solicitud_id, n]));

  const conSoporte = (permisos ?? []).filter((p) => p.soporte_url);
  const firmasSoporte = await Promise.all(
    conSoporte.map((p) => supabase.storage.from("soportes").createSignedUrl(p.soporte_url, 300))
  );
  const mapaSoportes = new Map<string, string>();
  conSoporte.forEach((p, i) => {
    const url = firmasSoporte[i].data?.signedUrl;
    if (url) mapaSoportes.set(p.solicitud_id, url);
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Bandeja de aprobación</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          Solicitudes pendientes donde fuiste elegido como líder de proceso.
        </p>
      </div>

      {lista.length === 0 ? (
        <div className="table-wrap">
          <div className="empty-state">
            <h3>No tienes solicitudes pendientes</h3>
            <p>Cuando alguien te elija como líder de proceso, aparecerá aquí.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {lista.map((s) => (
            <AprobacionRow
              key={s.id}
              solicitud={s}
              colaborador={mapaColaboradores.get(s.colaborador_id)!}
              permiso={mapaPermisos.get(s.id)}
              vacaciones={mapaVacaciones.get(s.id)}
              nomina={mapaNominas.get(s.id)}
              urlSoporte={mapaSoportes.get(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
