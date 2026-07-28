import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import type { Colaborador } from "@/lib/types";
import { ColaboradorForm } from "./colaborador-form";
import { ColaboradorRow } from "./colaborador-row";
import { ImportarExcelForm } from "./importar-excel-form";

export default async function ConfiguracionPage() {
  const yo = await getColaboradorActual();
  if (!yo?.es_lider_th) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: colaboradores } = await supabase
    .from("colaborador")
    .select("*")
    .order("nombre_completo");

  const lista = (colaboradores ?? []) as Colaborador[];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Configuración</p>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          Alta de colaboradores, asignación de líderes de área y del Líder de
          Talento Humano.
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
    </div>
  );
}
