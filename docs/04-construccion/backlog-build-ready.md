# Backlog técnico — deuda aceptada en Build Ready

Hallazgos Medios de la auditoría Opus (`docs/05-decisiones/auditoria-pre-codigo.md`) que no bloquean el inicio de construcción pero deben resolverse durante los cortes verticales correspondientes.

| ID | Hallazgo | Corte donde se resuelve | Estado |
|---|---|---|---|
| M1 | `es_lider_th` único solo validado en aplicación | Corte de Configuración | Resuelto — índice único parcial en `colaborador(es_lider_th) where es_lider_th` (migración 0001) |
| M2 | Sin validación de rangos de fecha/hora (`fecha_hasta >= fecha_desde`, etc.) | Corte de cada formulario | Resuelto — CHECKs en `solicitud_permiso` y `solicitud_vacaciones` (migración 0001) |
| M3 | Vínculo `colaborador` ↔ `auth.uid()` no definido | Corte de Auth | Resuelto — columna `auth_user_id` + `fn_vincular_colaborador()` (migración 0002) |
| M4 | Privacidad de montos de adelanto ante líder elegido libremente | Corte de Solicitud de Nómina | Aceptado sin restricción — consistente con la regla de PRD de selección libre de líder en los 3 tipos; no se implementó un aprobador restringido para Nómina |
| M5 | Sin validación de tipo/tamaño real del archivo de firma | Corte de subida de firma | Resuelto — Server Action valida `content-type` (image/jpeg) y tamaño máximo 2MB en los 3 formularios |
| M6 | Concurrencia: edición vs. aprobación simultánea | Corte de edición de solicitud pendiente | Aceptado sin control adicional — el líder aprueba/rechaza sobre el estado que ve; si el colaborador edita justo antes, el líder revisa datos ligeramente desactualizados en pantalla, pero el trigger de inmutabilidad impide decisiones sobre una solicitud ya editada a medio camino. Riesgo bajo dado el volumen y la ventana de tiempo. |
| M7 | Regeneración de PDF al editar una solicitud pendiente | Corte de edición de solicitud pendiente | No aplica — el PDF se genera únicamente al momento de la decisión (C3), nunca antes; editar una solicitud pendiente no tiene PDF que regenerar. |

## Resuelto en el corte de PDF, notificaciones y edición
- **Generación de PDF** (al momento de la decisión): implementada con `pdf-lib`, formato corporativo de Pixel Graphic con logo.
- **Notificaciones por email**: implementadas vía Resend; fallos se capturan sin bloquear el flujo (bloqueadas hoy solo por el sandbox de Resend sin dominio verificado — no por el código).
- **Editar solicitud pendiente**: implementado para los 3 tipos, reutilizando los formularios de creación en modo edición.

## Bug encontrado y corregido probando en vivo
Faltaban las políticas RLS de `UPDATE` en las tablas de detalle (`solicitud_permiso`, `solicitud_vacaciones`, `solicitud_nomina`). Sin ellas, un `UPDATE` se ejecutaba sin error pero afectaba 0 filas — la edición parecía funcionar pero no guardaba nada. Corregido en la migración `0004_update_detalle_policies.sql`.
