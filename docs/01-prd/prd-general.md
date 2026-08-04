# PRD — Sistema de Solicitudes PIXEL GRAPHIC

## 1. Contexto y problema
PIXEL GRAPHIC gestiona hoy las solicitudes de Permisos, Vacaciones y Adelantos de Nómina sin un sistema centralizado. No hay trazabilidad digital del flujo de aprobación (colaborador → líder de área → Talento Humano), lo que dificulta el seguimiento histórico y la auditoría por parte de Talento Humano.

## 2. Objetivo del producto
Digitalizar el ciclo completo de solicitud → aprobación → notificación → registro histórico para los tres tipos de solicitud, con trazabilidad total y visibilidad centralizada para Talento Humano.

## 3. Usuarios, roles y necesidades

| Rol | Necesidad principal |
|---|---|
| Colaborador | Radicar solicitudes fácilmente, ver el estado de las suyas |
| Líder de área | Ver solicitudes de su equipo, aprobar/rechazar con notas, ver dashboard/historial de su propio equipo |
| Líder de Talento Humano | Ver todas las solicitudes y su estado, administrar colaboradores/líderes, tener el dashboard consolidado de toda la empresa |

Un mismo colaborador puede tener varios roles simultáneamente (ej. ser Líder de área y también solicitante; el Líder de TH también puede ser Líder de área de su propio equipo).

## 4. Propuesta de valor
- Un solo lugar para solicitar y aprobar los 3 tipos de trámite.
- Notificaciones automáticas por correo en cada paso, sin gestión manual.
- Historial completo y auditable para Talento Humano, con dashboard de seguimiento.
- Formato final en PDF con firma incluida, listo para archivo.

## 5. Alcance del MVP y exclusiones

**Dentro del MVP:**
- Login con Google (OAuth) restringido a la lista de correos autorizados en la tabla `colaborador`.
- 3 formularios: Solicitud de Permisos, Solicitud de Vacaciones, Solicitud de Adelanto de Nómina.
- Flujo de aprobación de un solo nivel: Colaborador → Líder directo → (si aprueba) notificación a Líder de TH.
- Notificaciones por correo electrónico en cada transición de estado.
- Numeración consecutiva continua por tipo (SP-0001, SV-0001, SN-0001...).
- Carga de firma manuscrita (imagen JPG/JPEG) e inclusión en un PDF generado del formato correspondiente.
- Dashboard/historial para Talento Humano: todas las solicitudes, filtrable por colaborador, tipo, estado, fecha.
- Módulo de configuración: alta/baja de colaboradores, asignar/desasignar líderes de área, elegir Líder de Talento Humano.

**Fuera del MVP (explícito):**
- Ejecución o integración de pagos/transferencias bancarias reales.
- Aprobación multinivel (más de un líder en cadena) — se asume un solo líder directo por colaborador.
- App móvil nativa (se resuelve con diseño responsive, no apps separadas).
- Integración con nómina/ERP externo.
- Firma digital dibujada en pantalla (se usa imagen subida).

## 6. Módulos y funcionalidades
1. **Auth** — Google OAuth (Supabase Auth) + validación contra lista blanca de correos.
2. **Solicitudes** — formularios de Permisos / Vacaciones / Adelanto de Nómina.
3. **Aprobaciones** — bandeja de aprobación para líderes de área.
4. **Notificaciones** — envío de correos en cada cambio de estado.
5. **Generación de PDF** — formato final con firma incrustada.
6. **Dashboard TH** — historial, filtros, exportación (a definir en SDD).
7. **Configuración** — gestión de colaboradores (alta individual o importación masiva desde Excel), líderes, líder de TH.

## 7. Recorridos principales
- **Radicar solicitud**: colaborador inicia sesión → elige tipo → llena formulario → sube firma → envía.
- **Aprobar/rechazar**: líder recibe notificación → revisa → aprueba o rechaza con nota → sistema notifica al colaborador.
- **Cierre del ciclo**: si aprobado, Líder de TH recibe notificación y la solicitud queda visible en el dashboard.
- **Consulta histórica**: Líder de TH entra al dashboard, filtra por colaborador/tipo/estado/fecha.
- **Configuración**: Líder de TH agrega/elimina colaboradores (uno por uno o en bloque vía Excel) y asigna roles de líder.

## 8. Historias de usuario (jobs to be done)
- Como colaborador, quiero radicar una solicitud de permiso/vacaciones/adelanto sin papeleo físico, para que quede registrada y trazable.
- Como líder de área, quiero ver y aprobar/rechazar las solicitudes de mi equipo desde un solo lugar.
- Como colaborador, quiero saber por correo si mi solicitud fue aprobada o rechazada.
- Como Líder de TH, quiero ver el historial completo de solicitudes de todos los colaboradores para hacer seguimiento y auditoría.
- Como Líder de TH, quiero poder agregar/quitar colaboradores y asignar líderes sin depender de un desarrollador.

## 9. Reglas de negocio conocidas
- No hay un líder fijo asignado por colaborador. En cada formulario, el colaborador elige su líder de proceso de un desplegable con los líderes de área existentes (ej. 4 opciones). Puede elegir uno distinto en cada solicitud si aplica.
- Solo puede aprobar/rechazar el líder de área que fue elegido en esa solicitud puntual (no aprobación multinivel en el MVP).
- La numeración consecutiva (SP/SV/SN) es continua y nunca se reinicia ni se reutiliza, incluso si una solicitud es rechazada.
- Vacaciones: la solicitud debería radicarse con 45 días de anticipación a la fecha de descanso. Si no se cumple, el sistema **solo muestra una advertencia** y permite continuar; la decisión final de aceptar una solicitud tardía la toman el líder de área junto con el Líder de TH.
- Seleccionar un líder de proceso es obligatorio para enviar cualquier solicitud (el desplegable se llena con los colaboradores marcados como líder de área en configuración; si no hay ninguno configurado aún, el colaborador no puede enviar).
- Todo rechazo de una solicitud **requiere motivo obligatorio** escrito por el líder.
- Adelanto de Nómina: el sistema únicamente registra la solicitud; no ejecuta ni valida transferencias.
- Un colaborador puede tener múltiples roles (ej. líder de área + solicitante).
- La firma es obligatoria para completar/enviar cualquier solicitud.
- El PDF generado se almacena en el sistema (descargable después) y adicionalmente se envía por correo en cada notificación relevante.
- Área y Cargo (en Permiso/Vacaciones/Nómina) se eligen de un catálogo configurable (con opción de crear uno nuevo inline); cada solicitud congela el nombre elegido al momento de radicar — no se guardan en el perfil del colaborador ni se actualizan retroactivamente si el catálogo cambia después (v1.1).
- Un colaborador no puede elegir su propio nombre como líder de proceso en el desplegable (autoaprobación bloqueada), aunque sea también líder de área.
- Una solicitud en estado Pendiente puede ser editada o cancelada por el propio colaborador que la radicó. Una vez Aprobada o Rechazada, queda inmutable.
- Retención: las solicitudes y sus PDFs se conservan indefinidamente por defecto (son documentos laborales); no hay borrado automático. Solo un Líder de TH podría archivar/eliminar manualmente en el futuro (fuera del MVP).

## 10. Criterios de aceptación funcional
- Un usuario fuera de la lista de correos autorizados no puede iniciar sesión.
- El formulario muestra un desplegable con todos los líderes de área activos; no se puede enviar sin seleccionar uno.
- Una solicitud enviada genera un consecutivo único e inmutable.
- El líder directo del solicitante recibe notificación por correo al momento de la radicación.
- El colaborador recibe notificación por correo con la decisión (aprobado/rechazado) y el motivo si fue rechazado.
- Si es aprobado, el Líder de Talento Humano recibe notificación y la solicitud aparece en el dashboard con su estado correcto.
- El PDF generado incluye todos los campos del formulario correspondiente y la imagen de firma al final.
- El dashboard permite filtrar por colaborador, tipo de solicitud, estado y rango de fechas.
- El colaborador puede editar o cancelar su propia solicitud solo mientras esté en estado Pendiente; el sistema lo impide una vez decidida.
- El desplegable de líder de proceso excluye al propio colaborador autenticado, incluso si es líder de área.
- Desde configuración, el Líder de TH puede agregar/eliminar colaboradores y (des)asignar líderes sin intervención técnica.

## 11. Métricas de éxito
- % de solicitudes gestionadas 100% dentro del sistema (vs. medios informales) — meta: 100% a los 30 días de liberado.
- Tiempo promedio entre radicación y decisión del líder.
- 0 solicitudes con numeración duplicada o inconsistente.
- Adopción: % de colaboradores de la lista que han usado el sistema al menos una vez en el primer mes.

## 12. Dependencias, restricciones y preguntas abiertas
**Restricciones conocidas:**
- Depende de que Alejo entregue la lista inicial de colaboradores (nombre + correo) y quién es cada líder.
- Depende de un OAuth Client de Google Cloud (modo Externo, no restringido a un solo Workspace — ver nota de decisión en SDD sobre por qué, dado que hay colaboradores en dos Workspaces distintos: pixel-g.com y pxl.com) y de un servicio de email transaccional (Resend) para las notificaciones propias del sistema.

**Preguntas abiertas resueltas** (ver reglas de negocio sección 9 y roles sección 3): regla de 45 días, colaborador sin líder, motivo de rechazo, dashboard para líderes de área, almacenamiento de PDF y retención de datos.

**Preguntas abiertas restantes para el SDD:**
- Estructura exacta de estados de una solicitud (¿Pendiente / Aprobada / Rechazada, o hay estados intermedios?).
- Mecanismo técnico de envío de correo: Resend (resuelto en SDD).
- Cómo se genera el PDF (librería/servicio) y dónde se almacena físicamente (storage).

## 13. Fases futuras (fuera del MVP)
- Aprobación multinivel configurable.
- Integración con nómina/ERP para adelantos.
- Exportación de reportes (Excel/PDF) desde el dashboard.
- Firma digital dibujada en pantalla como alternativa a la imagen subida.
