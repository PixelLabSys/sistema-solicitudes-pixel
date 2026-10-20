import { plantillaCorreo } from "./plantilla";

export interface TipoContacto {
  etiqueta: string;
  icono: string;
  color: string;
  fondo: string;
}

export const TIPOS_CONTACTO: Record<string, TipoContacto> = {
  duda: { etiqueta: "Duda", icono: "❓", color: "#2568C8", fondo: "#E9F1FE" },
  problema: { etiqueta: "Algo no funciona", icono: "🚨", color: "#D93B2E", fondo: "#FDEAE8" },
  sugerencia: { etiqueta: "Sugerencia", icono: "💡", color: "#D97D00", fondo: "#FFF3E1" },
};

function esc(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function asuntoContacto(tipo: TipoContacto, nombre: string) {
  return `${tipo.icono} [PIXEL Solicitudes] ${tipo.etiqueta} — ${nombre}`.replace(/[\r\n]+/g, " ");
}

// Correo de «Dudas y sugerencias» del módulo Ayuda, con la plantilla de marca
// del sistema (logo incluido). Lo escrito por el usuario se escapa.
export function armarCorreoContacto(params: {
  tipo: TipoContacto;
  mensaje: string;
  nombre: string;
  email: string;
  roles: string[];
}) {
  const { tipo, mensaje, nombre, email, roles } = params;
  const fecha = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date());

  const fila = (k: string, v: string) =>
    `<tr><td style="padding:5px 0; width:80px; color:#9ca3af; font-size:12px; vertical-align:top;">${k}</td><td style="padding:5px 0; color:#0b1b29; font-size:13px;">${v}</td></tr>`;

  const html = plantillaCorreo({
    eyebrow: `${tipo.icono} ${tipo.etiqueta}`,
    titulo: `Mensaje de ${esc(nombre)} desde Ayuda`,
    colorEyebrow: tipo.color,
    ctaTexto: null,
    pie: `Responde a este correo para contestarle directamente a ${esc(nombre)}.`,
    parrafosHtml: `
      <div style="margin:0 0 20px 0; padding:16px; background:#f7f7f8; border:1px solid #e5e7eb; border-radius:8px; color:#0b1b29; font-size:14px; line-height:1.6; white-space:pre-wrap;">${esc(mensaje)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
        <tr><td colspan="2" style="padding-top:12px; font-size:10px; letter-spacing:1px; text-transform:uppercase; color:#9ca3af;">Enviado por</td></tr>
        ${fila("Nombre", esc(nombre))}
        ${fila("Correo", `<a href="mailto:${esc(email)}" style="color:#2568C8; text-decoration:none;">${esc(email)}</a>`)}
        ${fila("Roles", esc(roles.join(", ")))}
        ${fila("Fecha", esc(fecha))}
      </table>`,
  });

  const texto = `${tipo.icono} ${tipo.etiqueta}\n\n${mensaje}\n\n—\nEnviado desde el módulo Ayuda (Sistema de Solicitudes)\nUsuario: ${nombre} <${email}>\nRoles: ${roles.join(", ")}\nFecha: ${fecha}`;

  return { html, texto };
}
