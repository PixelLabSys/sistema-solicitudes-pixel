# Backlog técnico — deuda aceptada en Build Ready

Hallazgos Medios de la auditoría Opus (`docs/05-decisiones/auditoria-pre-codigo.md`) que no bloquean el inicio de construcción pero deben resolverse durante los cortes verticales correspondientes.

| ID | Hallazgo | Corte donde se resuelve | Estado |
|---|---|---|---|
| M1 | `es_lider_th` único solo validado en aplicación | Corte de Configuración | Resuelto — índice único parcial en `colaborador(es_lider_th) where es_lider_th` (migración 0001) |
| M2 | Sin validación de rangos de fecha/hora (`fecha_hasta >= fecha_desde`, etc.) | Corte de cada formulario | Resuelto — CHECKs en `solicitud_permiso` y `solicitud_vacaciones` (migración 0001) |
| M3 | Vínculo `colaborador` ↔ `auth.uid()` no definido | Corte de Auth | Resuelto — columna `auth_user_id` + `fn_vincular_colaborador()` (migración 0002) |
| M4 | Privacidad de montos de adelanto ante líder elegido libremente | Corte de Solicitud de Nómina | Aceptado sin restricción — consistente con la regla de PRD de selección libre de líder en los 3 tipos; no se implementó un aprobador restringido para Nómina |
| M5 | Sin validación de tipo/tamaño real del archivo de firma | Corte de subida de firma | Resuelto — Server Action valida `content-type` (image/jpeg) y tamaño máximo 2MB en los 3 formularios |
| M6 | Concurrencia: edición vs. aprobación simultánea | Corte de edición de solicitud pendiente | Pendiente — la función de "editar" solicitud pendiente aún no tiene UI (solo "cancelar" está implementado) |
| M7 | Regeneración de PDF al editar una solicitud pendiente | Corte de edición de solicitud pendiente | Pendiente — depende de M6 y de la implementación de generación de PDF (aún no construida) |

## Pendiente explícito de este primer corte
- **Generación de PDF** (al momento de la decisión, según C3): no implementada todavía — próximo corte.
- **Notificaciones por email** (Resend, radicación/decisión/aviso a TH): no implementadas todavía — próximo corte, junto con la configuración de Resend como proveedor SMTP de Supabase Auth (ver decisión de envío de correos en la sesión de construcción).
- **Editar solicitud pendiente**: solo se implementó "cancelar"; falta la UI de edición.
