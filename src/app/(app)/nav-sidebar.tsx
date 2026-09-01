"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconSolicitudes,
  IconPermiso,
  IconVacaciones,
  IconAdelanto,
  IconAprobacion,
  IconDashboard,
  IconConfiguracion,
} from "@/components/icons";

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

  const item = (href: string, label: string, Icon: (props: { className?: string }) => React.ReactElement) => (
    <Link href={href} className={`nav-item ${pathname === href ? "active" : ""}`} onClick={onNavigate}>
      <Icon className="nav-icon" />
      {label}
    </Link>
  );

  return (
    <nav className="nav">
      <p className="nav-section">Solicitudes</p>
      {item("/", "Mis solicitudes", IconSolicitudes)}
      {item("/solicitudes/nueva/permiso", "Nueva: Permiso", IconPermiso)}
      {item("/solicitudes/nueva/vacaciones", "Nueva: Vacaciones", IconVacaciones)}
      {item("/solicitudes/nueva/nomina", "Nueva: Adelanto", IconAdelanto)}

      {esLiderArea && (
        <>
          <p className="nav-section">Aprobación</p>
          {item("/aprobaciones", "Bandeja de aprobación", IconAprobacion)}
          {item("/dashboard", "Dashboard de mi equipo", IconDashboard)}
        </>
      )}

      {esLiderTh && (
        <>
          <p className="nav-section">Talento humano</p>
          {!esLiderArea && item("/dashboard", "Dashboard", IconDashboard)}
          {item("/configuracion", "Configuración", IconConfiguracion)}
        </>
      )}
    </nav>
  );
}
