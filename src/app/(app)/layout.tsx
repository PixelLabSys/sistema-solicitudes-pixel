import { redirect } from "next/navigation";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { VERSION_ACTUAL } from "@/lib/ayuda/novedades";
import { AppShell } from "./app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colaborador = await getColaboradorActual();

  if (!colaborador) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Tu cuenta no está vinculada a ningún colaborador
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            Contacta a Talento Humano para que verifiquen tu acceso al
            sistema.
          </p>
        </div>
      </div>
    );
  }

  if (!colaborador.activo) {
    redirect("/login");
  }

  const rol = colaborador.es_lider_th
    ? "Líder de Talento Humano"
    : colaborador.es_lider_area
    ? "Líder de área"
    : "Colaborador";

  return (
    <AppShell
      esLiderArea={colaborador.es_lider_area}
      esLiderTh={colaborador.es_lider_th}
      hayNovedadAyuda={colaborador.ayuda_version_vista !== VERSION_ACTUAL}
      nombreCompleto={colaborador.nombre_completo}
      rol={rol}
      avatarUrl={colaborador.avatar_url}
    >
      {children}
    </AppShell>
  );
}
