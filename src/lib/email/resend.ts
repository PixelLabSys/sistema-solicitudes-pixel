import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Remitente de prueba (sandbox de Resend). Cuando se verifique un dominio propio
// (ej. pixel-g.com), reemplazar por algo como "Sistema de Solicitudes <no-reply@pixel-g.com>".
export const REMITENTE = "Sistema de Solicitudes <onboarding@resend.dev>";
