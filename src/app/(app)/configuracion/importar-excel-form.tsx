"use client";

import { useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { importarColaboradores } from "./actions";

type FilaImportada = { nombre_completo: string; correo: string; cc: string };

function buscarValor(fila: Record<string, unknown>, claves: string[]): string {
  for (const key of Object.keys(fila)) {
    const normalizada = key.trim().toLowerCase();
    if (claves.includes(normalizada)) {
      return String(fila[key] ?? "").trim();
    }
  }
  return "";
}

export function ImportarExcelForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    creados: number;
    saltados: { correo: string; motivo: string }[];
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange() {
    const archivo = inputRef.current?.files?.[0];
    if (!archivo) return;

    setError(null);
    setResultado(null);

    startTransition(async () => {
      try {
        const buffer = await archivo.arrayBuffer();
        const libro = XLSX.read(buffer, { type: "array" });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        const filasCrudas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, { defval: "" });

        const filas: FilaImportada[] = filasCrudas.map((fila) => ({
          nombre_completo: buscarValor(fila, ["nombre completo", "nombre_completo", "nombre"]),
          correo: buscarValor(fila, ["correo", "correo electrónico", "email"]),
          cc: buscarValor(fila, ["cc", "cédula", "cedula"]),
        }));

        if (filas.length === 0) {
          setError("El archivo no tiene filas de datos.");
          return;
        }

        const res = await importarColaboradores(filas);
        setResultado(res);
      } catch {
        setError("No se pudo leer el archivo. Verifica que sea un .xlsx o .csv válido.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}
      {resultado && (
        <div
          className={resultado.saltados.length > 0 ? "alert alert-warning" : "alert alert-success"}
          style={{ marginBottom: 14 }}
        >
          <p style={{ marginBottom: resultado.saltados.length ? 6 : 0 }}>
            {resultado.creados} colaborador(es) creado(s).
            {resultado.saltados.length > 0 && ` ${resultado.saltados.length} fila(s) saltada(s):`}
          </p>
          {resultado.saltados.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {resultado.saltados.map((s, i) => (
                <li key={i}>
                  {s.correo}: {s.motivo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="form-group">
        <label className="form-label">
          Importar desde Excel (columnas: Nombre Completo, Correo, CC)
        </label>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="form-input"
          onChange={handleChange}
          disabled={pending}
        />
        {pending && <p className="form-hint">Importando...</p>}
      </div>
    </div>
  );
}
