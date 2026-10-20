"use client";

import { useState } from "react";
import { enviarMensajeSoporte } from "./soporte-actions";

const TIPOS = [
  { valor: "duda", etiqueta: "Tengo una duda" },
  { valor: "problema", etiqueta: "Algo no funciona" },
  { valor: "sugerencia", etiqueta: "Quiero sugerir algo" },
];

export function ContactoSoporte() {
  const [tipo, setTipo] = useState("duda");
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEstado("enviando");
    const res = await enviarMensajeSoporte(tipo, mensaje);
    if (res.error) {
      setError(res.error);
      setEstado("idle");
    } else {
      setMensaje("");
      setEstado("ok");
    }
  }

  return (
    <div className="card no-print" style={{ marginTop: 24 }}>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Para dudas o sugerencias del sistema</p>
      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
        Escríbenos desde aquí: el mensaje llega a lab@pixel-g.com con tu nombre y correo, y te responden directamente.
      </p>

      {estado === "ok" ? (
        <div className="alert alert-success">
          Mensaje enviado. Te responderán a tu correo.{" "}
          <button type="button" onClick={() => setEstado("idle")} style={{ textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>
            Enviar otro
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ maxWidth: 260 }}>
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
          <textarea
            className="form-textarea"
            required
            rows={4}
            maxLength={3000}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Cuéntanos qué pasa: en qué pantalla estabas, qué esperabas y qué viste (incluye el consecutivo de la solicitud si aplica)."
          />
          {error && <div className="alert alert-error">{error}</div>}
          <div>
            <button type="submit" className="btn btn-primary" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Enviando…" : "Enviar mensaje"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
