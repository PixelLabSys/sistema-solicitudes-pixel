import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Cargo } from "@/lib/types";
import { CertificadoForm } from "./certificado-form";

export default async function NuevaSolicitudCertificadoPage() {
  const colaborador = await getColaboradorActual();
  const supabase = await createClient();

  const [{ data: contrato }, { data: config }, { data: cargos }] = await Promise.all([
    supabase.from("colaborador_contrato").select("colaborador_id").eq("colaborador_id", colaborador?.id ?? "").maybeSingle(),
    supabase.from("certificado_config").select("firmante_id").maybeSingle(),
    supabase.from("cargo").select("*").eq("activo", true).order("nombre"),
  ]);

  const datosCompletos = Boolean(colaborador?.genero && contrato);
  const hayFirmante = Boolean(config?.firmante_id);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Solicitud de certificado laboral</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Talento Humano revisa tu solicitud y, al aprobarla, podrás descargar el certificado firmado.
        </p>
      </div>
      <div className="card">
        {!datosCompletos ? (
          <div className="alert alert-warning">
            Talento Humano aún no ha cargado tus datos laborales (género, fecha de ingreso, tipo de contrato y
            salario). Escríbeles para que los completen y puedas radicar tu solicitud.
          </div>
        ) : !hayFirmante ? (
          <div className="alert alert-warning">
            Aún no está definido quién firma los certificados. Contacta a Talento Humano.
          </div>
        ) : (
          <CertificadoForm cargos={((cargos ?? []) as Cargo[]).map((c) => c.nombre)} colaborador={colaborador!} />
        )}
      </div>
    </div>
  );
}
