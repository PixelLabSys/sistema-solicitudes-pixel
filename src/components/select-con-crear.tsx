"use client";

import { useState } from "react";

const VALOR_CREAR = "__crear_nuevo__";

export function SelectConCrear({
  name,
  opciones,
  valorInicial,
  crearNuevo,
  placeholder = "Selecciona...",
}: {
  name: string;
  opciones: string[];
  valorInicial?: string;
  crearNuevo: (nombre: string) => Promise<{ error: string | null }>;
  placeholder?: string;
}) {
  const [lista, setLista] = useState<string[]>(() => {
    if (valorInicial && !opciones.includes(valorInicial)) return [...opciones, valorInicial];
    return opciones;
  });
  const [valor, setValor] = useState(valorInicial ?? "");
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === VALOR_CREAR) {
      setMostrarCrear(true);
      return;
    }
    setValor(e.target.value);
  }

  async function handleCrear() {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    setError(null);
    setCreando(true);
    const res = await crearNuevo(nombre);
    setCreando(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setLista((prev) => (prev.includes(nombre) ? prev : [...prev, nombre]));
    setValor(nombre);
    setMostrarCrear(false);
    setNuevoNombre("");
  }

  return (
    <div>
      <select
        name={name}
        className="form-select"
        required
        value={valor}
        onChange={handleChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {lista.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={VALOR_CREAR}>+ Crear nuevo...</option>
      </select>

      {mostrarCrear && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <input
            className="form-input"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre nuevo"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={creando || !nuevoNombre.trim()}
            onClick={handleCrear}
          >
            {creando ? "..." : "Agregar"}
          </button>
        </div>
      )}
      {error && <div className="form-error" style={{ marginTop: 4 }}>{error}</div>}
    </div>
  );
}
