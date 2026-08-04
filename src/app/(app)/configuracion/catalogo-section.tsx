"use client";

import { useState, useTransition } from "react";
import type { Area, Cargo } from "@/lib/types";

type Item = Area | Cargo;

export function CatalogoSection({
  titulo,
  placeholder,
  items,
  crear,
  editar,
  alternarActivo,
}: {
  titulo: string;
  placeholder: string;
  items: Item[];
  crear: (nombre: string) => Promise<{ error: string | null }>;
  editar: (id: string, nombre: string) => Promise<{ error: string | null }>;
  alternarActivo: (id: string, activo: boolean) => Promise<{ error: string | null }>;
}) {
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState("");

  function handleCrear() {
    if (!nombreNuevo.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await crear(nombreNuevo.trim());
      if (res.error) setError(res.error);
      else setNombreNuevo("");
    });
  }

  function iniciarEdicion(item: Item) {
    setEditandoId(item.id);
    setNombreEdicion(item.nombre);
  }

  function guardarEdicion(id: string) {
    if (!nombreEdicion.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await editar(id, nombreEdicion.trim());
      if (res.error) setError(res.error);
      else setEditandoId(null);
    });
  }

  function toggleActivo(item: Item) {
    setError(null);
    startTransition(async () => {
      const res = await alternarActivo(item.id, !item.activo);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>{titulo}</p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="form-input"
          placeholder={placeholder}
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary btn-sm" disabled={pending || !nombreNuevo.trim()} onClick={handleCrear}>
          Agregar
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              background: "var(--surface2)",
              borderRadius: "var(--radius)",
            }}
          >
            {editandoId === item.id ? (
              <>
                <input
                  className="form-input"
                  value={nombreEdicion}
                  onChange={(e) => setNombreEdicion(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => guardarEdicion(item.id)}>
                  Guardar
                </button>
                <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => setEditandoId(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 13 }}>{item.nombre}</span>
                <span className={`badge ${item.activo ? "badge-green" : "badge-gray"}`}>
                  {item.activo ? "Activo" : "Inactivo"}
                </span>
                <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => iniciarEdicion(item)}>
                  Editar
                </button>
                <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => toggleActivo(item)}>
                  {item.activo ? "Desactivar" : "Activar"}
                </button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text3)" }}>Todavía no hay elementos.</p>
        )}
      </div>
    </div>
  );
}
