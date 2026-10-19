"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconSolicitudes,
  IconPermiso,
  IconVacaciones,
  IconAdelanto,
  IconAyuda,
  IconCertificado,
  IconAprobacion,
  IconDashboard,
  IconConfiguracion,
} from "@/components/icons";

export function NavSidebar({
  esLiderArea,
  esLiderTh,
  hayNovedadAyuda,
  onNavigate,
}: {
  esLiderArea: boolean;
  esLiderTh: boolean;
  hayNovedadAyuda: boolean;
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
      {item("/solicitudes/nueva/certificado", "Nueva: Certificado Laboral", IconCertificado)}

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

      <Link href="/ayuda" className={`nav-item ${pathname === "/ayuda" ? "active" : ""}`} onClick={onNavigate}>
        <IconAyuda className="nav-icon" />
        Ayuda
        {hayNovedadAyuda && (
          <span className="nav-badge" aria-label="Hay novedades sin leer">
            1
          </span>
        )}
      </Link>
    </nav>
  );
}
