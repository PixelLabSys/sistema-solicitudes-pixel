# Changelog — Sistema de Solicitudes PIXEL GRAPHIC

## v1.0 — Entrega inicial (2026-07-28)

**Funcionalidad completa:**
- Auth con Google OAuth (modo Externo, multi-Workspace: pixel-g.com y pxl-g.com), lista blanca en base de datos.
- Los 3 tipos de solicitud (Permiso, Vacaciones, Adelanto de Nómina): crear, editar y cancelar mientras estén Pendientes.
- Flujo de aprobación de un nivel, con líder de proceso elegido libremente por solicitud (sin autoaprobación).
- Generación de PDF con formato corporativo (logo de Pixel Graphic), al momento de la decisión.
- Notificaciones por correo (Resend, dominio verificado `pxl-g.com`) en cada transición de estado, con manejo explícito de fallos de envío.
- Dashboard con historial y filtros por colaborador, tipo, estado y rango de fechas (alcance distinto para líder de área vs. Líder de TH).
- Configuración: alta individual e importación masiva de colaboradores desde Excel, asignación de roles, con bloqueo de seguridad si un colaborador tiene solicitudes pendientes asignadas.

**Decisiones técnicas relevantes:**
- Next.js + Supabase (Postgres/RLS/Storage) + Resend + Vercel.
- Reglas de negocio críticas (no-autoaprobación, motivo de rechazo obligatorio, inmutabilidad tras decisión) reforzadas con constraints y triggers en base de datos, no solo en el frontend.
- Consecutivos generados con secuencias atómicas de Postgres (sin condiciones de carrera).

**Bugs encontrados y corregidos durante la construcción (probando en vivo):**
- Políticas RLS de `UPDATE` faltantes en las tablas de detalle — la edición de solicitudes parecía funcionar pero no guardaba cambios.
- El SDK de Resend no lanza excepciones en errores de la API — los fallos de envío se registraban silenciosamente como éxito.
- Falta de filtros de colaborador y rango de fechas en el Dashboard (contra el criterio de aceptación del PRD).
- El error de "aprobar" una solicitud no se mostraba en pantalla (solo el de "rechazar").

**Datos iniciales cargados:** 20 colaboradores reales de Pixel Graphic (importados vía Excel).
