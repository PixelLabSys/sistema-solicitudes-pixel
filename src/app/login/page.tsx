"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  async function handleLoginGoogle() {
    setCargando(true);
    setMensajeError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setCargando(false);
      setMensajeError("No pudimos iniciar sesión con Google. Intenta de nuevo.");
    }
  }

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const errorUrl = params?.get("error");
  const mensajeErrorUrl =
    errorUrl === "no_autorizado"
      ? "Tu cuenta de Google no tiene acceso al sistema. Contacta a Talento Humano."
      : errorUrl
      ? "No pudimos iniciar tu sesión. Intenta de nuevo."
      : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 40,
          width: "min(400px, 92vw)",
          boxShadow: "0 24px 64px rgba(0,0,0,.4)",
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          Sistema de Solicitudes
        </p>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 24 }}>
          PIXEL GRAPHIC SAS
        </p>

        {(mensajeError || mensajeErrorUrl) && (
          <div
            style={{
              background: "rgba(248,81,73,.12)",
              border: "1px solid rgba(248,81,73,.3)",
              borderRadius: "var(--radius)",
              padding: "10px 12px",
              fontSize: 12,
              color: "var(--red)",
              marginBottom: 16,
            }}
          >
            {mensajeError || mensajeErrorUrl}
          </div>
        )}

        <button
          onClick={handleLoginGoogle}
          disabled={cargando}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {cargando ? "Redirigiendo..." : "Iniciar sesión con Google"}
        </button>
      </div>
    </div>
  );
}
