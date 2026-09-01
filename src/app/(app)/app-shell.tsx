"use client";

import { useState } from "react";
import { useTheme } from "@/lib/useTheme";
import { IconMenu, IconClose, IconSun, IconMoon, IconLogout } from "@/components/icons";
import { NavSidebar } from "./nav-sidebar";

export function AppShell({
  esLiderArea,
  esLiderTh,
  nombreCompleto,
  rol,
  avatarUrl,
  children,
}: {
  esLiderArea: boolean;
  esLiderTh: boolean;
  nombreCompleto: string;
  rol: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { tema, alternar } = useTheme();
  const logo = tema === "dark" ? "/pixel-logo-inv.png" : "/pixel-logo.png";
  const inicial = nombreCompleto.charAt(0).toUpperCase();

  return (
    <div className="app">
      <div className="mobile-topbar">
        <button className="menu-toggle" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <IconMenu />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="Pixel Graphic" />
        <div style={{ width: 34 }} />
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="logo-area">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="Pixel Graphic" style={{ height: 52, width: "auto", display: "block" }} />
          <button
            className="menu-toggle"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
          >
            <IconClose />
          </button>
        </div>

        <NavSidebar esLiderArea={esLiderArea} esLiderTh={esLiderTh} onNavigate={() => setOpen(false)} />

        <div className="sidebar-bottom">
          <button
            type="button"
            onClick={alternar}
            aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="theme-toggle"
          >
            <span className="theme-toggle-label">
              {tema === "dark" ? <IconMoon /> : <IconSun />}
              {tema === "dark" ? "Oscuro" : "Claro"}
            </span>
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb" />
            </span>
          </button>

          <div className="user-block">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="user-avatar-img" referrerPolicy="no-referrer" />
            ) : (
              <div className="user-avatar">{inicial}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <p className="user-name">{nombreCompleto}</p>
              <p className="user-role">{rol}</p>
            </div>
          </div>

          <form action="/api/auth/signout" method="post">
            <button type="submit" className="logout-btn">
              <IconLogout />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <div className="main">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
