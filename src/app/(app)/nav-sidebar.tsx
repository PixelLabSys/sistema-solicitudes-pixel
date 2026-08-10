"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NavSidebar({
  esLiderArea,
  esLiderTh,
  onNavigate,
}: {
  esLiderArea: boolean;
  esLiderTh: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const item = (href: string, label: string) => (
    <Link href={href} className={`nav-item ${pathname === href ? "active" : ""}`} onClick={onNavigate}>
      {label}
    </Link>
  );

  return (
    <nav className="nav">
      <p className="nav-section">Solicitudes</p>
      {item("/", "Mis solicitudes")}
      {item("/solicitudes/nueva/permiso", "Nueva: Permiso")}
      {item("/solicitudes/nueva/vacaciones", "Nueva: Vacaciones")}
      {item("/solicitudes/nueva/nomina", "Nueva: Adelanto")}

      {esLiderArea && (
        <>
          <p className="nav-section">Aprobación</p>
          {item("/aprobaciones", "Bandeja de aprobación")}
          {item("/dashboard", "Dashboard de mi equipo")}
        </>
      )}

      {esLiderTh && (
        <>
          <p className="nav-section">Talento humano</p>
          {!esLiderArea && item("/dashboard", "Dashboard")}
          {item("/configuracion", "Configuración")}
        </>
      )}

      <p className="nav-section">Cuenta</p>
      <button
        onClick={handleLogout}
        className="nav-item"
        style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
