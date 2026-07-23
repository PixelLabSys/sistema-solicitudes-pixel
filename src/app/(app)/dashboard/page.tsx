import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador, EstadoSolicitud, Solicitud, TipoSolicitud } from "@/lib/types";
import { EstadoBadge } from "@/lib/estado-badge";
import { FiltrosDashboard } from "./filtros-dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string }>;
}) {
  const yo = await getColaboradorActual();
  if (!yo || (!yo.es_lider_th && !yo.es_lider_area)) redirect("/");

  const { tipo, estado } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("solicitud").select("*").order("creado_en", { ascending: false });
  if (tipo) query = query.eq("tipo", tipo as TipoSolicitud);
  if (estado) query = query.eq("estado", estado as EstadoSolicitud);

  const { data: solicitudes } = await query;
  const lista = (solicitudes ?? []) as Solicitud[];

  const colaboradorIds = [...new Set(lista.map((s) => s.colaborador_id))];
  const { data: colaboradores } = await supabase
    .from("colaborador")
    .select("*")
    .in("id", colaboradorIds.length ? colaboradorIds : ["00000000-0000-0000-0000-000000000000"]);
  const mapaColaboradores = new Map(
    ((colaboradores ?? []) as Colaborador[]).map((c) => [c.id, c])
  );

  const urlsPdf = new Map<string, string>();
  for (const s of lista) {
    if (s.pdf_url) {
      const { data } = await supabase.storage.from("pdfs").createSignedUrl(s.pdf_url, 300);
      if (data?.signedUrl) urlsPdf.set(s.id, data.signedUrl);
    }
  }

  const pendientes = lista.filter((s) => s.estado === "pendiente").length;
  const aprobadas = lista.filter((s) => s.estado === "aprobada").length;
  const rechazadas = lista.filter((s) => s.estado === "rechazada").length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>
          Dashboard{yo.es_lider_th ? "" : " de mi equipo"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          {yo.es_lider_th
            ? "Historial completo de solicitudes de todos los colaboradores."
            : "Solicitudes donde has sido elegido como líder de proceso."}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value stat-yellow">{pendientes}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Aprobadas</div>
          <div className="stat-value stat-green">{aprobadas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rechazadas</div>
          <div className="stat-value stat-red">{rechazadas}</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <FiltrosDashboard />
        </div>
        <table>
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Colaborador</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Radicada</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((s) => (
              <tr key={s.id}>
                <td className="td-mono">{s.consecutivo}</td>
                <td>{mapaColaboradores.get(s.colaborador_id)?.nombre_completo ?? "—"}</td>
                <td style={{ textTransform: "capitalize" }}>{s.tipo}</td>
                <td>
                  <EstadoBadge estado={s.estado} />
                </td>
                <td className="td-mono">
                  {new Date(s.creado_en).toLocaleDateString("es-CO")}
                </td>
                <td>
                  {urlsPdf.has(s.id) ? (
                    <a href={urlsPdf.get(s.id)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      Ver
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div className="empty-state">
            <h3>No hay solicitudes con estos filtros</h3>
          </div>
        )}
      </div>
    </div>
  );
}
