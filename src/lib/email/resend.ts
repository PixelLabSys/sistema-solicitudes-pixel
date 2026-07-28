import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const REMITENTE = "Sistema de Solicitudes <notificaciones@pxl-g.com>";
