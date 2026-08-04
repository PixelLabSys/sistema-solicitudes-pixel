# Changelog — Sistema de Solicitudes PIXEL GRAPHIC

## v1.1 — Mejoras post-entrega (2026-08-04)

Feedback recibido tras la presentación y entrega inicial al cliente.

**Nuevo:**
- **Soporte adjunto en Permiso**: archivo opcional (PDF/JPG/PNG, máx. 5MB) para justificar la solicitud (ej. cita médica, cita en colegio).
- **Vacaciones mixtas**: nuevo tipo que combina días disfrutados y compensados, con selector de "días a compensar" (1 a 30) independiente del rango de fechas.
- **Catálogos de Área y Cargo**: reemplazan los campos de texto libre en Vacaciones y Permiso por desplegables configurables (con opción "Crear nueva" inline desde cualquier formulario). Editables/desactivables desde Configuración. Las solicitudes ya radicadas conservan el nombre histórico aunque el catálogo cambie después (snapshot, no referencia viva).
- **Vista previa en Bandeja de Aprobación**: cada tarjeta pendiente tiene un ícono "Ver solicitud" (PDF generado al vuelo, sin persistir) y, si aplica, "Ver soporte" para revisar el archivo adjunto antes de decidir.
- **Múltiples Líderes de TH**: se elimina la restricción de unicidad — ahora puede haber varias personas con ese rol simultáneamente, como redundancia operativa.
- **Área y Cargo en Permiso**: se agregaron también estos dos campos (antes solo estaban en Vacaciones), con el mismo patrón de catálogo + creación inline.
- **Nombres de archivo legibles**: los PDF descargados desde "Mis solicitudes" y el Dashboard ahora se guardan como `SP-####.pdf` / `SV-####.pdf` / `SN-####.pdf` en vez del identificador interno (UUID).

**Decisiones técnicas:**
- Igual que con área/cargo de Vacaciones, los nuevos campos de Permiso son texto congelado al radicar (no FK viva) — consistente con el principio de snapshot histórico ya usado en el resto del sistema.
- La vista previa de PDF pendiente es una ruta de solo lectura que genera el documento en cada solicitud sin escribir en `pdf_url` — ese campo solo se llena en el momento oficial de la decisión.

**Datos de prueba:** se eliminaron todas las solicitudes de prueba y el colaborador de prueba "Camila Ríos" antes de la segunda presentación al cliente; los consecutivos (SP/SV/SN) se reiniciaron en 0001.

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
