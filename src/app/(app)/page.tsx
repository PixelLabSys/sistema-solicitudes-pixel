import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Solicitud } from "@/lib/types";
import { EstadoBadge } from "@/lib/estado-badge";
import { IconEye, IconDownload } from "@/components/icons";
import { CancelarBoton } from "./cancelar-boton";

export default async function MisSolicitudesPage() {
  const colaborador = await getColaboradorActual();
  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("solicitud")
    .select("*")
    .eq("colaborador_id", colaborador?.id ?? "")
    .order("creado_en", { ascending: false });

  const lista = (solicitudes ?? []) as Solicitud[];

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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Mis solicitudes</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Historial de tus solicitudes de permisos, vacaciones y adelantos.
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Radicada</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((s) => (
              <tr key={s.id}>
                <td className="td-mono">{s.consecutivo}</td>
                <td style={{ textTransform: "capitalize" }}>{s.tipo}</td>
                <td>
                  <EstadoBadge estado={s.estado} />
                  {s.estado === "rechazada" && s.motivo_rechazo && (
                    <div style={{ fontSize: 11, color: "var(--subtle)", marginTop: 4 }}>
                      {s.motivo_rechazo}
                    </div>
                  )}
                </td>
                <td className="td-mono">
                  {new Date(s.creado_en).toLocaleDateString("es-CO")}
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  {s.estado === "pendiente" && (
                    <>
                      <Link href={`/solicitudes/editar/${s.id}`} className="btn btn-ghost btn-sm">
                        Editar
                      </Link>
                      <CancelarBoton solicitudId={s.id} />
                    </>
                  )}
                  {urlsVer.has(s.id) && (
                    <>
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
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div className="empty-state">
            <h3>Todavía no tienes solicitudes</h3>
            <p>Radica tu primera solicitud desde el menú de la izquierda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
