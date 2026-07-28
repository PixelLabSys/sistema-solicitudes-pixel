import { redirect } from "next/navigation";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";
import { NavSidebar } from "./nav-sidebar";

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
          <p style={{ fontSize: 13, color: "var(--text2)" }}>
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

  const iniciales = colaborador.nombre_completo
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rol = colaborador.es_lider_th
    ? "Líder de Talento Humano"
    : colaborador.es_lider_area
    ? "Líder de área"
    : "Colaborador";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo-area" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pixel-logo-inv.png" alt="Pixel Graphic" style={{ height: 47, width: "auto", display: "block" }} />
          <p className="logo-sub" style={{ marginTop: 8 }}>Sistema de solicitudes</p>
        </div>
        <NavSidebar
          esLiderArea={colaborador.es_lider_area}
          esLiderTh={colaborador.es_lider_th}
        />
        <div className="sidebar-footer" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="user-avatar">{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <p className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {colaborador.nombre_completo}
            </p>
            <p className="user-role">{rol}</p>
          </div>
        </div>
      </aside>
      <div className="main">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
