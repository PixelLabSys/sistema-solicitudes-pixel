import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador, EstadoSolicitud, Solicitud, TipoSolicitud } from "@/lib/types";
import { EstadoBadge } from "@/lib/estado-badge";
import { FiltrosDashboard } from "./filtros-dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; estado?: string; colaborador_id?: string; desde?: string; hasta?: string }>;
}) {
  const yo = await getColaboradorActual();
  if (!yo || (!yo.es_lider_th && !yo.es_lider_area)) redirect("/");

  const { tipo, estado, colaborador_id, desde, hasta } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("solicitud").select("*").order("creado_en", { ascending: false });
  if (tipo) query = query.eq("tipo", tipo as TipoSolicitud);
  if (estado) query = query.eq("estado", estado as EstadoSolicitud);
  if (colaborador_id) query = query.eq("colaborador_id", colaborador_id);
  if (desde) query = query.gte("creado_en", desde);
  if (hasta) query = query.lte("creado_en", hasta + "T23:59:59");

  // Solicitudes visibles sin filtrar, para poblar el desplegable de colaboradores
  // (RLS ya limita esto al alcance del líder de área o a todo para TH). Es
  // independiente de la consulta filtrada de abajo, así que corren en paralelo.
  const [{ data: solicitudesVisibles }, { data: solicitudes }] = await Promise.all([
    supabase.from("solicitud").select("colaborador_id"),
    query,
  ]);

  const colaboradorIdsVisibles = [...new Set((solicitudesVisibles ?? []).map((s) => s.colaborador_id))];
  const { data: colaboradoresDisponibles } = await supabase
    .from("colaborador")
    .select("*")
    .in("id", colaboradorIdsVisibles.length ? colaboradorIdsVisibles : ["00000000-0000-0000-0000-000000000000"])
    .order("nombre_completo");

  const lista = (solicitudes ?? []) as Solicitud[];

  // colaboradoresDisponibles ya es un superset de todos los colaboradores en
  // `lista` (misma tabla, mismo alcance de RLS, sin los filtros de arriba),
  // así que reutilizarlo evita una tercera consulta idéntica.
  const mapaColaboradores = new Map(
    ((colaboradoresDisponibles ?? []) as Colaborador[]).map((c) => [c.id, c])
  );

  const conPdf = lista.filter((s) => s.pdf_url);
  const firmasPdf = await Promise.all(
    conPdf.map((s) =>
      supabase.storage
        .from("pdfs")
        .createSignedUrl(s.pdf_url!, 300, { download: `${s.consecutivo}.pdf` })
    )
  );
  const urlsPdf = new Map<string, string>();
  conPdf.forEach((s, i) => {
    const url = firmasPdf[i].data?.signedUrl;
    if (url) urlsPdf.set(s.id, url);
  });

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
          <FiltrosDashboard colaboradores={(colaboradoresDisponibles ?? []) as Colaborador[]} />
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
