"use server";

import { resend, REMITENTE } from "@/lib/email/resend";
import { TIPOS_CONTACTO, armarCorreoContacto, asuntoContacto } from "@/lib/email/contacto-ayuda";
import { getColaboradorActual } from "@/lib/data/colaborador-actual";

const DESTINO = "lab@pixel-g.com";

// Mensaje de soporte desde el módulo Ayuda: llega a lab@pixel-g.com con
// Reply-To al correo de quien escribe.
export async function enviarMensajeSoporte(tipo: string, mensaje: string): Promise<{ error: string | null }> {
  const yo = await getColaboradorActual();
  if (!yo) return { error: "No autenticado" };

  const texto = typeof mensaje === "string" ? mensaje.trim() : "";
  if (typeof tipo !== "string" || !Object.hasOwn(TIPOS_CONTACTO, tipo)) return { error: "Tipo de mensaje no válido" };
  if (texto.length < 10) return { error: "Cuéntanos un poco más (mínimo 10 caracteres)" };
  if (texto.length > 3000) return { error: "El mensaje es muy largo (máximo 3000 caracteres)" };

  const roles = ["Colaborador"];
  if (yo.es_lider_area) roles.push("Líder de área");
  if (yo.es_lider_th) roles.push("Líder de Talento Humano");
  if (yo.es_lider_general) roles.push("Líder general");

  const tipoInfo = TIPOS_CONTACTO[tipo];
  const correo = armarCorreoContacto({
    tipo: tipoInfo,
    mensaje: texto,
    nombre: yo.nombre_completo,
    email: yo.correo,
    roles,
  });

  try {
    const { error } = await resend.emails.send({
      from: REMITENTE,
      to: DESTINO,
      replyTo: yo.correo,
      subject: asuntoContacto(tipoInfo, yo.nombre_completo),
      html: correo.html,
      text: correo.texto,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("No se pudo enviar el mensaje de soporte:", e);
    return { error: "No se pudo enviar el mensaje. Escribe directamente a lab@pixel-g.com." };
  }
  return { error: null };
}
