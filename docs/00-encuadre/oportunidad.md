# Encuadre de oportunidad — Sistema de Solicitudes PIXEL GRAPHIC

## Situación actual y dolor observable
PIXEL GRAPHIC gestiona las solicitudes de Permisos, Vacaciones y Adelantos de Nómina sin un sistema centralizado. No hay trazabilidad digital del flujo de aprobación, lo que dificulta el seguimiento histórico y la auditoría por parte de Talento Humano.

## Usuarios o actores afectados
- Colaboradores (todos, radican solicitudes).
- Líderes de área (subconjunto de colaboradores, aprueban solicitudes de su equipo).
- Líder de Talento Humano (uno de los colaboradores, con visibilidad total y acceso de configuración).

Ejemplo de tamaño: ~25 colaboradores, ~4 líderes de área, 1 de ellos también Líder de TH.

## Proceso actual (manual)
Un colaborador solicita permiso/vacaciones/adelanto por un medio no centralizado (papel, correo, chat). El líder directo aprueba o rechaza. Si aprueba, la información debería llegar también a Talento Humano, pero no hay garantía de trazabilidad ni historial consultable.

## Impacto operativo
- Sin historial confiable, Talento Humano no puede auditar fácilmente cuántos permisos/vacaciones/adelantos se han otorgado por colaborador.
- Firma manuscrita y formato final quedan dispersos en vez de centralizados.
- No regulatorio crítico, pero sí implica manejo de documentos laborales (permisos, vacaciones, adelantos de nómina) que conviene conservar con trazabilidad por razones legales/laborales.

## Evidencia disponible y supuestos aún no comprobados
- Evidencia: formatos actuales de los 3 tipos de solicitud (provistos por Alejo), estructura de roles (colaborador/líder de área/líder de TH).
- Supuesto: cada colaborador tiene un único líder directo (no aprobación multinivel) — confirmado como regla de negocio del MVP.
- Supuesto: la lista de colaboradores y correos será entregada por Alejo antes de construir la lista blanca de auth.

## Resultado esperado
Un sistema web (responsive) donde cualquier colaborador autenticado con su correo de Google Workspace pueda radicar las 3 solicitudes, el líder directo apruebe/rechace, se notifique por correo en cada paso, y Talento Humano tenga un dashboard de historial completo y un módulo de configuración de colaboradores/líderes.

## Restricciones conocidas
- Auth restringido a lista blanca de correos (Google OAuth).
- No se gestionan pagos/transferencias reales — solo registro de la solicitud.
- Un solo nivel de aprobación (líder directo) en el MVP.

## Delimitación — dentro y fuera
**Dentro:** los 3 formularios, flujo de aprobación de un nivel, notificaciones por correo, generación de PDF con firma, dashboard de historial (TH y líderes ven el de su equipo), módulo de configuración de colaboradores/líderes.

**Fuera:** ejecución de pagos, aprobación multinivel, app móvil nativa, integración con nómina/ERP externo, firma dibujada en pantalla.

## Decisión de salida
Vale la pena explorar y construir. Se avanza a PRD (Fase 1).
