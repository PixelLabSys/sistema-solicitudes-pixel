import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Sistema de Solicitudes | Pixel Graphic SAS",
  description:
    "Política de privacidad del Sistema de Solicitudes de Pixel Graphic SAS.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pixel-logo.png" alt="Pixel Graphic" style={{ height: 40, width: "auto" }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
          Política de Privacidad
        </h1>
        <p style={{ fontSize: 13, color: "var(--subtle)", marginBottom: 36 }}>
          Sistema de Solicitudes — Pixel Graphic SAS · Última actualización: septiembre de 2026
        </p>

        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg)" }}>
          <p style={{ marginBottom: 20 }}>
            El Sistema de Solicitudes es una herramienta interna de Pixel Graphic SAS,
            usada exclusivamente por sus colaboradores para radicar y aprobar
            solicitudes de permisos, vacaciones y adelantos de nómina. No es una
            aplicación pública ni comercial; no recolecta datos de personas ajenas
            a la empresa.
          </p>

          <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
            1. Datos que recopilamos
          </h2>
          <p style={{ marginBottom: 10 }}>Al iniciar sesión con tu cuenta de Google, obtenemos:</p>
          <ul style={{ margin: "0 0 20px", paddingLeft: 20 }}>
            <li>Tu nombre, correo electrónico y foto de perfil de Google.</li>
            <li>
              Los datos que registras dentro del sistema: nombre completo, cédula,
              cargo, área, y el contenido de cada solicitud (fechas, tipo, motivo,
              valores, firma en imagen, y soportes adjuntos cuando aplica).
            </li>
          </ul>
          <p style={{ marginBottom: 20 }}>
            No solicitamos ni accedemos a ningún otro dato de tu cuenta de Google
            (contactos, correo, archivos de Drive, calendario, etc.). El inicio de
            sesión con Google se usa únicamente para verificar tu identidad.
          </p>

          <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
            2. Para qué usamos estos datos
          </h2>
          <p style={{ marginBottom: 20 }}>
            Exclusivamente para operar el flujo interno de solicitud → aprobación →
            notificación → registro histórico entre colaboradores, sus líderes de
            proceso y el equipo de Talento Humano de Pixel Graphic SAS.
          </p>

          <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
            3. Dónde se almacenan
          </h2>
          <p style={{ marginBottom: 20 }}>
            La información se guarda en una base de datos gestionada por Supabase,
            con acceso restringido por rol (colaborador, líder de área, Talento
            Humano). Las firmas y soportes adjuntos se guardan en almacenamiento
            privado, accesible solo mediante enlaces firmados y temporales.
          </p>

          <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
            4. Con quién compartimos esta información
          </h2>
          <p style={{ marginBottom: 20 }}>
            No compartimos, vendemos ni cedemos esta información a terceros. Solo es
            visible para el propio colaborador, su líder de proceso designado en
            cada solicitud, y el equipo de Talento Humano.
          </p>

          <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
            5. Retención y eliminación
          </h2>
          <p style={{ marginBottom: 20 }}>
            Las solicitudes se conservan como registro laboral mientras el
            colaborador esté vinculado a la empresa. Puedes solicitar la
            corrección o eliminación de tus datos personales escribiendo al correo
            de contacto abajo.
          </p>

          <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
            6. Contacto
          </h2>
          <p style={{ marginBottom: 0 }}>
            Para preguntas sobre esta política o tus datos, escribe a{" "}
            <a href="mailto:lab@pixel-g.com" style={{ color: "var(--navy)" }}>
              lab@pixel-g.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
