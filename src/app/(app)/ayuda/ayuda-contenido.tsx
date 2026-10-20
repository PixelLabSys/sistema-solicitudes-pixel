"use client";

import { useEffect, useState } from "react";
import { NOVEDADES } from "@/lib/ayuda/novedades";
import { MANUALES, type RolAyuda } from "@/lib/ayuda/manuales";
import { marcarAyudaVista } from "./actions";
import { ContactoSoporte } from "./contacto-soporte";

export function AyudaContenido({ roles, hayNovedad }: { roles: RolAyuda[]; hayNovedad: boolean }) {
  const [pestana, setPestana] = useState<"novedades" | "manual">("novedades");
  const [rolActivo, setRolActivo] = useState<RolAyuda>(roles[roles.length - 1]);
  const [novedadNueva] = useState(hayNovedad);

  useEffect(() => {
    if (hayNovedad) void marcarAyudaVista();
  }, [hayNovedad]);

  const manual = MANUALES[rolActivo];

  return (
    <div>
      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          className={`btn btn-sm ${pestana === "novedades" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setPestana("novedades")}
        >
          Novedades
        </button>
        <button
          className={`btn btn-sm ${pestana === "manual" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setPestana("manual")}
        >
          Manual de usuario
        </button>
      </div>

      {pestana === "novedades" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {NOVEDADES.map((n, i) => (
            <div className="card" key={n.version}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{n.titulo}</p>
                {i === 0 && novedadNueva && <span className="badge badge-blue">Nuevo</span>}
              </div>
              <p style={{ fontSize: 12, color: "var(--subtle)", marginBottom: 10 }}>{n.fecha}</p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, listStyle: "disc" }}>
                {n.puntos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {pestana === "manual" && (
        <div>
          <div
            className="no-print"
            style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {roles.length > 1 &&
                roles.map((r) => (
                  <button
                    key={r}
                    className={`btn btn-sm ${rolActivo === r ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setRolActivo(r)}
                  >
                    {MANUALES[r].etiqueta}
                  </button>
                ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              Imprimir o guardar en PDF
            </button>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Manual de usuario: {manual.etiqueta}</p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>{manual.resumen}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {manual.secciones.map((s) => (
              <div className="card" key={s.titulo}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{s.titulo}</p>
                {s.parrafo && <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: s.pasos ? 8 : 0 }}>{s.parrafo}</p>}
                {s.pasos && (
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, listStyle: "decimal" }}>
                    {s.pasos.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ContactoSoporte />
    </div>
  );
}
