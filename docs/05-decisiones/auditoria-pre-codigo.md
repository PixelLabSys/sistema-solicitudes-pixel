# Auditoría pre-código (Fase 4.5) — Sistema de Solicitudes PIXEL GRAPHIC

Auditoría adversarial ejecutada con Claude Opus sobre el paquete consolidado (PRD + SDD + artefactos). Instrucción: cuestionar, no confirmar. Alejo decide y responde cada hallazgo.

## Matriz de hallazgos

| ID | Hallazgo | Evidencia | Impacto | Prob. | Severidad | Recomendación | Doc afectado | Bloquea |
|---|---|---|---|---|---|---|---|---|
| C1 | No se define si las Server Actions usan la *service role key* (bypassa RLS) o el token del usuario. De esto depende que RLS proteja o no las escrituras. | SDD §5 dice "RLS es la seguridad real"; §7 dice escrituras vía Server Actions. Ambas no pueden ser ciertas si la action usa service role. | Un colaborador podría escribir estados/roles vía API saltando RLS | Media | **Crítico** | Definir: Server Actions usan token del usuario y RLS aplica; la lógica de negocio se valida además con constraints/funciones en BD, no solo en la action | SDD §5, §7 | Sí |
| C2 | Reglas de negocio críticas (no-autoaprobación, motivo de rechazo obligatorio, firma obligatoria, solo editar/cancelar en pendiente) descritas en frontend/Server Action, saltables con el cliente Supabase directo. | SDD §6 y §9; RLS §5 permite a un líder hacer `update` de estado directo. | Autoaprobación real, rechazo sin motivo, aprobar fuera de flujo | Media | **Crítico** | Mover cada regla a la BD: `CHECK (lider_aprobador_id <> colaborador_id)`, `CHECK (estado<>'rechazada' OR motivo_rechazo<>'')`, trigger que impida cambiar estado desde no-pendiente, RLS que restrinja columnas actualizables | SDD §5, §6 | Sí |
| C3 | El PDF "formato final con firma" se genera al radicar (diagrama B4→B6), antes de la decisión. No refleja aprobación/rechazo, quién decidió ni cuándo. | Artefacto flujo B4→B6; PRD §4 "formato final listo para archivo". | El entregable central no sirve como constancia de aprobación | Alta | **Crítico** | Decidir: el PDF definitivo se genera al momento de la decisión (aprobado/rechazado) e incluye resultado, líder y fecha. Opcional PDF de radicación aparte | SDD §4, artefacto flujo | Sí |
| C4 | Se promete "reintento asíncrono" de emails fallidos, pero la arquitectura (Vercel serverless + Supabase) no incluye cola ni cron que lo ejecute. | SDD §9 "se reintenta de forma asíncrona"; §2 no tiene componente de jobs. | Emails que fallan nunca se reenvían; el mecanismo no existe | Media | **Alto** | Definir mecanismo real: Supabase pg_cron / Edge Function programada, o cola (ej. Supabase Queues), o aceptar "sin reintento automático, TH reenvía manual" y quitar la promesa | SDD §9, §2 | Decisión |
| A1 | Solicitudes huérfanas: si TH desmarca como líder o desactiva a un colaborador con solicitudes pendientes asignadas a él, nadie puede aprobarlas. | SDD §5; modelo `lider_aprobador_id` fijo por solicitud. | Solicitudes atascadas sin aprobador | Media | **Alto** | Definir regla: al quitar rol/desactivar, reasignar o notificar; o bloquear el cambio si tiene pendientes | SDD §5, Configuración | Decisión |
| A2 | "Baja" de colaborador ambigua: ¿borrado (hard delete) o desactivación (`activo=false`)? Un borrado rompe FK de solicitudes históricas y viola la retención indefinida. | PRD §10 "eliminar colaboradores" vs. §9 retención indefinida; modelo tiene `activo`. | Pérdida de historial o error de integridad referencial | Media | **Alto** | Definir explícitamente: baja = soft-delete (`activo=false`), nunca borrado físico mientras existan solicitudes. "Eliminar" en UI = desactivar | PRD §10, SDD §3 | Decisión |
| A3 | Consecutivo bajo concurrencia: si se genera con `SELECT max()+1` en la action hay condición de carrera → números duplicados. | SDD §3 "secuencia por tipo"; métrica "0 duplicados". | Viola criterio de unicidad del consecutivo | Baja | **Alto** | Usar secuencia atómica de Postgres (`CREATE SEQUENCE` por tipo) o función con lock, nunca max()+1 en aplicación. Aceptar que habrá huecos por cancelaciones/rechazos | SDD §3 | Decisión |
| M1 | `es_lider_th` único solo validado en aplicación. Un bug deja dos TH con acceso total. | SDD §3 nota. | Dos personas con acceso total y a configuración | Baja | **Medio** | Índice único parcial: `UNIQUE (es_lider_th) WHERE es_lider_th` | SDD §3 | Backlog |
| M2 | Sin validación de rangos: `fecha_hasta >= fecha_desde`, `hora_hasta > hora_desde`, `ingreso_a_laborar > fecha_hasta` vacaciones. | SDD §6 solo cubre `valor_neto>0`. | Datos incoherentes (permiso que termina antes de empezar) | Media | **Medio** | Añadir CHECKs de rango en cada tabla de detalle | SDD §6 | Backlog |
| M3 | Vínculo entre usuario de Supabase Auth (su propio uuid) y fila `colaborador` no está definido; el join implícito es por correo, frágil si el correo cambia. | SDD §5; PK de colaborador es uuid propio, no auth.uid. | Usuario autenticado sin poder mapear a su colaborador | Baja | **Medio** | Definir: `colaborador.auth_user_id = auth.uid()` poblado al primer login, o usar auth.uid como PK | SDD §5 | Backlog |
| M4 | Privacidad de montos de adelanto: el colaborador elige libremente cualquier líder de área, que verá el `valor_neto` del adelanto. Puede no ser el líder correcto para ese dato sensible. | PRD §9 elección libre de líder; SDD §10 datos sensibles. | Exposición de monto de adelanto a un líder no pertinente | Media | **Medio** | Decidir si adelantos van a un aprobador restringido (ej. solo TH) en vez de cualquier líder elegido | PRD §9 | Decisión |
| M5 | Sin validación de archivo de firma: tipo real (no solo extensión), tamaño máximo, no ejecutable. | PRD §9 "JPG/JPEG"; SDD no especifica límites. | Subida de archivos maliciosos o pesados al Storage | Media | **Medio** | Validar MIME real + tamaño (ej. ≤2MB) en Server Action y política de Storage | SDD §10 | Backlog |
| M6 | Concurrencia edición vs. aprobación: colaborador edita en pendiente mientras el líder aprueba. La edición podría pisar la decisión. | SDD §4 transiciones. | La solicitud aprobada muestra datos distintos a los aprobados | Baja | **Medio** | Concurrencia optimista (columna `version`/`updated_at` en el update) | SDD §4 | Backlog |
| M7 | Editar una solicitud pendiente: ¿se regenera el PDF? ¿cambia el consecutivo? No definido. | SDD §4 "colaborador edita". | PDF desactualizado respecto a los datos editados | Baja | **Medio** | Regla: editar mantiene consecutivo, regenera PDF de radicación (si existe); ver C3 | SDD §4 | Backlog |

## Resumen ejecutivo

- **Críticos (bloquean código): C1, C2, C3, C4** — todos giran en torno a dos temas: (a) dónde vive de verdad la seguridad y las reglas (BD vs. frontend), y (b) qué es exactamente el PDF "final" y cómo se notifica de forma confiable.
- **Altos (requieren decisión explícita antes de programar): A1, A2, A3.**
- **Medios (backlog técnico con responsable): M1–M7.**

Regla TRAZA: ningún módulo pasa a Build Ready con críticos abiertos ni altos sin decisión documentada.

## Decisiones de Alejo

| ID | Decisión | Fecha | Estado |
|---|---|---|---|
| C1 | Server Actions usan el token de sesión del usuario, nunca la service role key. RLS aplica también a escrituras del servidor. | 2026-07-22 | Resuelto |
| C2 | Reglas críticas (no-autoaprobación, motivo de rechazo, inmutabilidad tras decisión, columnas editables por rol) movidas a constraints/triggers/RLS de columna en Postgres. | 2026-07-22 | Resuelto |
| C3 | El PDF se genera una sola vez, al momento de la decisión (Aprobada/Rechazada), incluyendo resultado, líder y fecha. No se genera para Pendiente/Cancelada. | 2026-07-22 | Resuelto |
| C4 | Sin reintento automático de emails en el MVP (decisión aceptada, no deuda oculta). Fallo queda visible en `SOLICITUD_EVENTO` con botón de reenvío manual para TH. | 2026-07-22 | Resuelto |
| A1 | Desactivar/quitar rol de líder a alguien con solicitudes pendientes asignadas queda bloqueado hasta resolverlas. | 2026-07-22 | Resuelto |
| A2 | "Baja" de colaborador es siempre soft-delete (`activo=false`); nunca borrado físico. | 2026-07-22 | Resuelto |
| A3 | Consecutivo generado con secuencia atómica de Postgres por tipo (`nextval()`), nunca `max()+1` en aplicación. | 2026-07-22 | Resuelto |

Los hallazgos Medios (M1–M7) quedan en el backlog técnico del SDD/construcción, no bloquean Build Ready.
