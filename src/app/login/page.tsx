"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/useTheme";

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const { tema } = useTheme();
  const logo = tema === "dark" ? "/pixel-logo-inv.png" : "/pixel-logo.png";

  async function handleLoginGoogle() {
    setCargando(true);
    setMensajeError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
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
          boxShadow: "0 24px 64px rgba(34,48,80,.12)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="Pixel Graphic" style={{ height: 65, width: "auto", display: "block", marginBottom: 12 }} />
          <p style={{ fontSize: 12, color: "var(--subtle)", marginBottom: 24 }}>
            Sistema de Solicitudes
          </p>
        </div>

        {(mensajeError || mensajeErrorUrl) && (
          <div
            style={{
              background: "var(--estado-danger-bg)",
              border: "1px solid var(--estado-danger-bg)",
              borderRadius: "var(--radius)",
              padding: "10px 12px",
              fontSize: 12,
              color: "var(--estado-danger-text)",
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
