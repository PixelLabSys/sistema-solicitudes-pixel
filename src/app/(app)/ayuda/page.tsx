import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { VERSION_ACTUAL } from "@/lib/ayuda/novedades";
import type { RolAyuda } from "@/lib/ayuda/manuales";
import { AyudaContenido } from "./ayuda-contenido";

export default async function AyudaPage() {
  const yo = await getColaboradorActual();

  const roles: RolAyuda[] = ["colaborador"];
  if (yo?.es_lider_area) roles.push("lider_area");
  if (yo?.es_lider_th) roles.push("lider_th");
  if (yo?.es_lider_general) roles.push("lider_general");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Ayuda</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Novedades del sistema y manual de usuario según tu rol.
        </p>
      </div>
      <AyudaContenido roles={roles} hayNovedad={yo?.ayuda_version_vista !== VERSION_ACTUAL} />
    </div>
  );
}
