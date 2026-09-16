import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type {
  Colaborador,
  EstadoSolicitud,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
  TipoSolicitud,
} from "@/lib/types";
import { EstadoBadge } from "@/lib/estado-badge";
import { IconEye, IconDownload } from "@/components/icons";
import { FiltrosDashboard } from "./filtros-dashboard";
import { ExportarExcelBoton } from "./exportar-excel-boton";

const TIPO_LABEL: Record<TipoSolicitud, string> = {
  permiso: "Permiso",
  vacaciones: "Vacaciones",
  nomina: "Adelanto",
};

const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
};

const TIPO_PERMISO_LABEL: Record<SolicitudPermisoDetalle["tipo_permiso"], string> = {
  medico: "Médico",
  personal: "Personal",
  escolar: "Escolar",
  judicial: "Judicial",
};

const TIPO_VACACIONES_LABEL: Record<SolicitudVacacionesDetalle["tipo_vacaciones"], string> = {
  compensadas: "Compensadas",
  disfrutadas: "Disfrutadas",
  mixtas: "Mixtas",
};

const TIPO_ADELANTO_LABEL: Record<SolicitudNominaDetalle["tipo_adelanto"], string> = {
  nomina: "Nómina",
  prima: "Prima",
  cuenta_cobro: "Cuenta de cobro",
};

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
  const [firmasVer, firmasDescargar] = await Promise.all([
    Promise.all(conPdf.map((s) => supabase.storage.from("pdfs").createSignedUrl(s.pdf_url!, 300))),
    Promise.all(
      conPdf.map((s) =>
        supabase.storage.from("pdfs").createSignedUrl(s.pdf_url!, 300, { download: `${s.consecutivo}.pdf` })
      )
    ),
  ]);
  const urlsVer = new Map<string, string>();
  const urlsDescargar = new Map<string, string>();
  conPdf.forEach((s, i) => {
    const urlVer = firmasVer[i].data?.signedUrl;
    const urlDescargar = firmasDescargar[i].data?.signedUrl;
    if (urlVer) urlsVer.set(s.id, urlVer);
    if (urlDescargar) urlsDescargar.set(s.id, urlDescargar);
  });

  const idsPermiso = lista.filter((s) => s.tipo === "permiso").map((s) => s.id);
  const idsVacaciones = lista.filter((s) => s.tipo === "vacaciones").map((s) => s.id);
  const idsNomina = lista.filter((s) => s.tipo === "nomina").map((s) => s.id);

  const [{ data: permisoDetalles }, { data: vacacionesDetalles }, { data: nominaDetalles }] =
    await Promise.all([
      idsPermiso.length
        ? supabase.from("solicitud_permiso").select("*").in("solicitud_id", idsPermiso)
        : Promise.resolve({ data: [] as SolicitudPermisoDetalle[] }),
      idsVacaciones.length
        ? supabase.from("solicitud_vacaciones").select("*").in("solicitud_id", idsVacaciones)
        : Promise.resolve({ data: [] as SolicitudVacacionesDetalle[] }),
      idsNomina.length
        ? supabase.from("solicitud_nomina").select("*").in("solicitud_id", idsNomina)
        : Promise.resolve({ data: [] as SolicitudNominaDetalle[] }),
    ]);

  const mapaPermiso = new Map(
    ((permisoDetalles ?? []) as SolicitudPermisoDetalle[]).map((d) => [d.solicitud_id, d])
  );
  const mapaVacaciones = new Map(
    ((vacacionesDetalles ?? []) as SolicitudVacacionesDetalle[]).map((d) => [d.solicitud_id, d])
  );
  const mapaNomina = new Map(
    ((nominaDetalles ?? []) as SolicitudNominaDetalle[]).map((d) => [d.solicitud_id, d])
  );

  const filasExport = lista.map((s) => {
    const permiso = mapaPermiso.get(s.id);
    const vacaciones = mapaVacaciones.get(s.id);
    const nomina = mapaNomina.get(s.id);

    return {
      consecutivo: s.consecutivo,
      colaborador: mapaColaboradores.get(s.colaborador_id)?.nombre_completo ?? "—",
      tipo: TIPO_LABEL[s.tipo],
      estado: ESTADO_LABEL[s.estado],
      lider_aprobador: mapaColaboradores.get(s.lider_aprobador_id)?.nombre_completo ?? "—",
      radicada: new Date(s.creado_en).toLocaleDateString("es-CO"),
      decidida: s.decidido_en ? new Date(s.decidido_en).toLocaleDateString("es-CO") : "—",
      area: permiso?.area ?? vacaciones?.area ?? "",
      cargo: permiso?.cargo_actual ?? vacaciones?.cargo_actual ?? nomina?.cargo ?? "",
      fecha_desde: permiso?.fecha_desde ?? vacaciones?.fecha_desde ?? "",
      fecha_hasta: permiso?.fecha_hasta ?? vacaciones?.fecha_hasta ?? "",
      hora_desde: permiso?.hora_desde ?? "",
      hora_hasta: permiso?.hora_hasta ?? "",
      dias_concedidos: permiso?.dias_concedidos ?? "",
      horas_concedidas: permiso?.horas_concedidas ?? "",
      tipo_detalle: permiso
        ? TIPO_PERMISO_LABEL[permiso.tipo_permiso]
        : vacaciones
          ? TIPO_VACACIONES_LABEL[vacaciones.tipo_vacaciones]
          : nomina
            ? TIPO_ADELANTO_LABEL[nomina.tipo_adelanto]
            : "",
      dias_compensados: vacaciones?.dias_compensados ?? "",
      ingreso_a_laborar: vacaciones?.ingreso_a_laborar ?? "",
      valor_neto: nomina?.valor_neto ?? "",
      transferencia_bancaria: nomina ? (nomina.transferencia_bancaria ? "Sí" : "No") : "",
      descripcion: permiso?.descripcion ?? vacaciones?.observaciones ?? "",
      motivo_rechazo: s.motivo_rechazo ?? "",
    };
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
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
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
          <ExportarExcelBoton filas={filasExport} />
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
                  {urlsVer.has(s.id) ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <a
                        href={urlsVer.get(s.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                        title="Ver PDF"
                        aria-label="Ver PDF"
                      >
                        <IconEye />
                      </a>
                      <a
                        href={urlsDescargar.get(s.id)}
                        className="btn btn-ghost btn-sm"
                        title="Descargar PDF"
                        aria-label="Descargar PDF"
                      >
                        <IconDownload />
                      </a>
                    </div>
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
