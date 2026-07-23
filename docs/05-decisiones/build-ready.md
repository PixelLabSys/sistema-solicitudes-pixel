# Decisión Build Ready — Sistema de Solicitudes PIXEL GRAPHIC

**Fecha:** 2026-07-22
**Responsable de aceptar el resultado:** Alejo Morales
**Decisión:** ✅ GO — Build Ready

## Checklist ejecutivo (verificado)

- [x] El problema y el usuario están claramente definidos (`docs/00-encuadre/oportunidad.md`).
- [x] El módulo pertenece al alcance aprobado del ciclo (PRD §5).
- [x] Funcionalidades y exclusiones están explícitas (PRD §5, §6).
- [x] Reglas, roles, permisos y estados están definidos, y reforzados a nivel de base de datos tras la auditoría (SDD §5, §6).
- [x] Datos e integraciones están especificados (SDD §3, §8).
- [x] El flujo completo fue representado y validado (prototipo navegable aprobado por Alejo).
- [x] Existe un mapa mental actualizado de módulos, capacidades y dependencias (`docs/03-artefactos/mapa-mental-modulos.md`).
- [x] Los recorridos y decisiones están representados mediante diagramas de flujo (`docs/03-artefactos/diagramas-flujo.md`, con carriles por actor).
- [x] Se contemplaron errores, vacíos y excepciones (SDD §9).
- [x] Cada historia tiene criterios de aceptación comprobables (PRD §10).
- [x] Los riesgos críticos fueron resueltos o aceptados (auditoría Opus, 4 críticos + 3 altos resueltos, ver `auditoria-pre-codigo.md`).
- [x] Existe una estrategia de pruebas (SDD §13).
- [x] La documentación no presenta contradicciones conocidas.
- [x] Claude Opus realizó la auditoría técnica pre-código.
- [x] No existen hallazgos críticos abiertos ni hallazgos altos sin decisión.
- [x] Hay una persona responsable de aceptar el resultado: Alejo Morales.
- [x] La decisión Build Ready queda registrada en este documento.

## Alcance autorizado a construir (MVP)
1. Auth con Google restringido a lista blanca de correos.
2. Los 3 formularios de solicitud (Permisos, Vacaciones, Adelanto de Nómina).
3. Flujo de aprobación de un nivel con desplegable de líder por solicitud.
4. Notificaciones por correo (sin reintento automático, con reenvío manual).
5. Generación de PDF al momento de la decisión.
6. Dashboard con filtros (alcance por rol: TH ve todo, líder ve donde fue elegido aprobador).
7. Módulo de configuración (colaboradores, líderes, líder de TH).

## Deuda técnica aceptada (backlog, no bloqueante)
Ver `docs/04-construccion/backlog-build-ready.md` — hallazgos M1 a M7 de la auditoría.

## Próximo paso
Fase 6 — Construcción por cortes verticales. El primer corte propuesto: **Auth + alta de colaboradores en Configuración + Solicitud de Permisos de extremo a extremo** (radicar → aprobar/rechazar → PDF → dashboard), antes de replicar el patrón a Vacaciones y Nómina.
