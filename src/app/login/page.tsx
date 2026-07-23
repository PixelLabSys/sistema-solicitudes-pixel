"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Paso = "correo" | "codigo";

export default function LoginPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensajeError("");

    const supabase = createClient();
    const correoNormalizado = correo.trim().toLowerCase();

    const { data: autorizado, error: errorRpc } = await supabase.rpc(
      "fn_correo_autorizado",
      { p_correo: correoNormalizado }
    );

    if (errorRpc) {
      setCargando(false);
      setMensajeError("No pudimos validar tu correo. Intenta de nuevo.");
      return;
    }

    if (!autorizado) {
      setCargando(false);
      setMensajeError(
        "Tu correo no tiene acceso al sistema. Contacta a Talento Humano."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: correoNormalizado,
    });

    setCargando(false);

    if (error) {
      setMensajeError("No pudimos enviar el código. Intenta de nuevo.");
      return;
    }

    setPaso("codigo");
  }

  async function handleVerificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensajeError("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: correo.trim().toLowerCase(),
      token: codigo.trim(),
      type: "email",
    });

    if (error) {
      setCargando(false);
      setMensajeError("El código no es válido o expiró. Solicita uno nuevo.");
      return;
    }

    await supabase.rpc("fn_vincular_colaborador");
    router.push("/");
    router.refresh();
  }

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

        {mensajeError && (
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
            {mensajeError}
          </div>
        )}

        {paso === "correo" ? (
          <form onSubmit={handleEnviarCodigo}>
            <label
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--text3)",
              }}
            >
              Correo
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nombre@pixel-g.com"
              className="form-input"
              style={{ marginTop: 5, marginBottom: 18 }}
            />
            <button
              type="submit"
              disabled={cargando}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {cargando ? "Enviando..." : "Enviar código de acceso"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificarCodigo}>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
              Te enviamos un código de 6 dígitos a <strong>{correo}</strong>.
              Escríbelo abajo.
            </p>
            <label
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--text3)",
              }}
            >
              Código
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="123456"
              className="form-input"
              style={{ marginTop: 5, marginBottom: 18, fontFamily: "var(--mono)", letterSpacing: "0.2em" }}
            />
            <button
              type="submit"
              disabled={cargando}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
            >
              {cargando ? "Verificando..." : "Entrar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPaso("correo");
                setCodigo("");
                setMensajeError("");
              }}
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Usar otro correo
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
