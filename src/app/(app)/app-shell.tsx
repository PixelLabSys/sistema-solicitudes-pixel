"use client";

import { useState } from "react";
import { NavSidebar } from "./nav-sidebar";

export function AppShell({
  esLiderArea,
  esLiderTh,
  nombreCompleto,
  rol,
  iniciales,
  children,
}: {
  esLiderArea: boolean;
  esLiderTh: boolean;
  nombreCompleto: string;
  rol: string;
  iniciales: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app">
      <div className="mobile-topbar">
        <button
          className="menu-toggle"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pixel-logo-inv.png" alt="Pixel Graphic" />
        <div style={{ width: 34 }} />
      </div>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div
          className="logo-area"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pixel-logo-inv.png" alt="Pixel Graphic" style={{ height: 47, width: "auto", display: "block" }} />
          <p className="logo-sub" style={{ marginTop: 8 }}>Sistema de solicitudes</p>
        </div>
        <NavSidebar esLiderArea={esLiderArea} esLiderTh={esLiderTh} onNavigate={() => setOpen(false)} />
        <div className="sidebar-footer" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="user-avatar">{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <p className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nombreCompleto}
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
