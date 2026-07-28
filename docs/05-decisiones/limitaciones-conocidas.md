# Registro de limitaciones conocidas — Sistema de Solicitudes PIXEL GRAPHIC

Fase 7 de TRAZA. Estas limitaciones son conocidas y aceptadas para la v1.0 — no son bugs, son alcance explícitamente fuera del MVP o deuda técnica aceptada con su razón documentada.

## Fuera de alcance del MVP (PRD §13 — fases futuras)
- Aprobación multinivel (más de un líder en cadena).
- Integración con nómina/ERP externo para los adelantos.
- Exportación de reportes (Excel/PDF) desde el Dashboard.
- Firma digital dibujada en pantalla (hoy solo se acepta imagen JPG/JPEG subida).

## Deuda técnica aceptada (ver `04-construccion/backlog-build-ready.md`)
- **M4** — Cualquier líder de área elegido puede ver el monto de un adelanto de nómina (no hay un aprobador restringido para ese tipo). Aceptado porque es consistente con la regla de selección libre de líder.
- **M6** — Si un colaborador edita una solicitud pendiente justo cuando el líder la está aprobando, el líder pudo haber visto datos ligeramente desactualizados en pantalla. El trigger de inmutabilidad evita una decisión inconsistente, pero no hay bloqueo optimista de concurrencia.

## Dependencias externas activas
- **Dominio de correo**: las notificaciones salen desde `pxl-g.com` (verificado en Resend), no desde `pixel-g.com` — el acceso al DNS de `pixel-g.com` en GoDaddy no se pudo recuperar durante esta entrega. Si en el futuro se recupera el acceso, se puede verificar también `pixel-g.com` en Resend y cambiar el remitente.
- **Auth multi-dominio sin probar en `pxl-g.com`**: el login con Google se probó exhaustivamente con cuentas personales de Gmail. No se hizo una prueba en vivo con una cuenta real `@pxl-g.com` autenticándose (el diseño lo soporta — modo Externo, sin restricción de dominio de Google — pero falta la validación empírica con ese dominio específico).

## Configuración pendiente de decisión operativa (no técnica)
- Asignación de roles de "Líder de área" a los colaboradores reales importados — el Líder de TH debe revisar y marcar manualmente quiénes son líderes en Configuración (el import de Excel no asigna roles automáticamente, por diseño).
- Retención de datos: el PRD definió retención indefinida por defecto (sin borrado automático); no se implementó ninguna función de archivado, ya que no era necesaria para el MVP.
