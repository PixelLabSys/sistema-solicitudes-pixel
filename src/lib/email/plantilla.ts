const LOGO_URL = "https://sistema-solicitudes-pixel.vercel.app/pixel-logo.png";
const APP_URL = "https://sistema-solicitudes-pixel.vercel.app";

const NAVY = "#0b1b29";
const ORANGE = "#d2884a";
const GRIS = "#6b7280";
const GRIS_CLARO = "#9ca3af";
const FONDO = "#f4f4f5";
const BORDE = "#e5e7eb";

export function plantillaCorreo(params: {
  eyebrow: string;
  titulo: string;
  parrafosHtml: string;
  ctaTexto?: string;
  colorEyebrow?: string;
}) {
  const { eyebrow, titulo, parrafosHtml, ctaTexto = "Ir al Sistema de Solicitudes", colorEyebrow = ORANGE } = params;

  return `
<!doctype html>
<html lang="es">
  <body style="margin:0; padding:0; background:${FONDO}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FONDO}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid ${BORDE};">
            <tr>
              <td style="padding:32px 32px 24px 32px; text-align:center;">
                <img src="${LOGO_URL}" alt="Pixel Graphic" height="68" style="height:68px; width:auto; display:inline-block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <div style="height:3px; width:100%; background:${ORANGE}; border-radius:2px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:${colorEyebrow};">
                  ${eyebrow}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 16px 32px;">
                <h1 style="margin:0; font-size:20px; line-height:1.35; font-weight:700; color:${NAVY};">${titulo}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px 32px; font-size:14px; line-height:1.6; color:${GRIS};">
                ${parrafosHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <a href="${APP_URL}" style="display:inline-block; background:${NAVY}; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; padding:12px 24px; border-radius:8px;">
                  ${ctaTexto}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid ${BORDE}; text-align:center;">
                <p style="margin:0; font-size:11px; color:${GRIS_CLARO};">
                  Pixel Graphic SAS &middot; Sistema de Solicitudes<br />
                  Este es un mensaje automático, no respondas a este correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
