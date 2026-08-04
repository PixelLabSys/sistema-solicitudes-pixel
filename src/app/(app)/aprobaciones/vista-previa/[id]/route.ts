import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { generarPdfSolicitud } from "@/lib/pdf/generar-pdf-solicitud";
import type {
  Colaborador,
  Solicitud,
  SolicitudNominaDetalle,
  SolicitudPermisoDetalle,
  SolicitudVacacionesDetalle,
} from "@/lib/types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const yo = await getColaboradorActual();
  if (!yo) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const supabase = await createClient();

  // RLS ya limita esto a las solicitudes donde `yo` es el líder aprobador
  // o el Líder de TH — si no aplica, la consulta simplemente no encuentra nada.
  const { data: solicitud } = await supabase.from("solicitud").select("*").eq("id", id).single();
  if (!solicitud) return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });

  const s = solicitud as Solicitud;

  const { data: colaborador } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", s.colaborador_id)
    .single();
  const { data: lider } = await supabase
    .from("colaborador")
    .select("*")
    .eq("id", s.lider_aprobador_id)
    .single();

  if (!colaborador || !lider) {
    return NextResponse.json({ error: "No se encontró el colaborador o el líder." }, { status: 404 });
  }

  const tablaDetalle =
    s.tipo === "permiso" ? "solicitud_permiso" : s.tipo === "vacaciones" ? "solicitud_vacaciones" : "solicitud_nomina";
  const { data: detalle } = await supabase.from(tablaDetalle).select("*").eq("solicitud_id", s.id).single();
  if (!detalle) return NextResponse.json({ error: "No se encontró el detalle." }, { status: 404 });

  if (!s.firma_url) return NextResponse.json({ error: "La solicitud no tiene firma registrada." }, { status: 400 });

  const { data: firmaBlob, error: errorFirma } = await supabase.storage.from("firmas").download(s.firma_url);
  if (errorFirma || !firmaBlob) {
    return NextResponse.json({ error: "No se pudo leer la firma." }, { status: 500 });
  }

  const firmaBytes = new Uint8Array(await firmaBlob.arrayBuffer());

  const pdfBytes = await generarPdfSolicitud({
    solicitud: s,
    colaborador: colaborador as Colaborador,
    lider: lider as Colaborador,
    detalle: detalle as SolicitudPermisoDetalle | SolicitudVacacionesDetalle | SolicitudNominaDetalle,
    estadoFinal: s.estado === "pendiente" ? "pendiente" : (s.estado as "aprobada" | "rechazada"),
    motivoRechazo: s.motivo_rechazo,
    firmaBytes,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${s.consecutivo}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
