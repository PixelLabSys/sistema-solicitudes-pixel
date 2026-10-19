import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Area, Cargo, CertificadoConfig, Colaborador, ColaboradorContrato } from "@/lib/types";
import { ColaboradorForm } from "./colaborador-form";
import { ColaboradorRow } from "./colaborador-row";
import { ImportarExcelForm } from "./importar-excel-form";
import { CatalogoSection } from "./catalogo-section";
import { DatosLaboralesSection } from "./datos-laborales-section";
import { CertificadoConfigSection } from "./certificado-config-section";
import {
  crearArea,
  editarArea,
  alternarAreaActivo,
  crearCargo,
  editarCargo,
  alternarCargoActivo,
} from "@/lib/data/catalogos-actions";

const ultimaActualizacion = new Date(process.env.NEXT_PUBLIC_BUILD_TIME!).toLocaleString("es-CO", {
  timeZone: "America/Bogota",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export default async function ConfiguracionPage() {
  const yo = await getColaboradorActual();
  if (!yo?.es_lider_th) {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: colaboradores }, { data: areas }, { data: cargos }, { data: contratos }, { data: certConfig }, { data: certFirma }] =
    await Promise.all([
    supabase.from("colaborador").select("*").order("nombre_completo"),
    supabase.from("area").select("*").order("nombre"),
    supabase.from("cargo").select("*").order("nombre"),
    supabase.from("colaborador_contrato").select("*"),
    supabase.from("certificado_config").select("*").maybeSingle(),
    supabase.from("certificado_firma").select("id").maybeSingle(),
  ]);

  const lista = (colaboradores ?? []) as Colaborador[];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Configuración</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Alta de colaboradores, asignación de líderes de área, catálogos de
          área/cargo, Líderes de Talento Humano (puede haber varios, como
          respaldo entre sí), y el Líder General (recibe automáticamente las
          solicitudes de Adelanto de Nómina — solo puede haber uno).
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>
          Nuevo colaborador
        </p>
        <ColaboradorForm />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>
          Importar colaboradores desde Excel
        </p>
        <ImportarExcelForm />
      </div>

      <CatalogoSection
        titulo="Áreas"
        placeholder="Nombre del área nueva (ej. Diseño)"
        items={(areas ?? []) as Area[]}
        crear={crearArea}
        editar={editarArea}
        alternarActivo={alternarAreaActivo}
      />

      <CatalogoSection
        titulo="Cargos"
        placeholder="Nombre del cargo nuevo (ej. Diseñador)"
        items={(cargos ?? []) as Cargo[]}
        crear={crearCargo}
        editar={editarCargo}
        alternarActivo={alternarCargoActivo}
      />

      <CertificadoConfigSection colaboradores={lista} config={(certConfig as CertificadoConfig | null) ?? null} tieneFirma={Boolean(certFirma)} />

      <DatosLaboralesSection colaboradores={lista} contratos={(contratos ?? []) as ColaboradorContrato[]} />

      <div className="table-wrap">
        <div className="table-header">
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            Colaboradores ({lista.length})
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>CC</th>
              <th>Líder de área</th>
              <th>Líder de TH</th>
              <th>Líder General</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <ColaboradorRow key={c.id} colaborador={c} esYo={c.id === yo.id} />
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div className="empty-state">
            <h3>No hay colaboradores todavía</h3>
            <p>Agrega el primero desde el formulario de arriba.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "var(--subtle)", lineHeight: 1.7 }}>
        <p>Pixel Graphic SAS / Área Inteligencia de Negocio ®2026</p>
        <p>Última actualización: {ultimaActualizacion}</p>
      </div>
    </div>
  );
}
