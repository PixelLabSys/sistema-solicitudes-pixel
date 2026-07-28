# Acta de Entrega — Sistema de Solicitudes PIXEL GRAPHIC

**Proyecto:** Sistema de Solicitudes de Permisos, Vacaciones y Adelantos de Nómina
**Cliente:** Pixel Graphic SAS
**Fecha de entrega:** 2026-07-28
**Metodología:** TRAZA (Encuadre → PRD → SDD → Artefactos → Tensión → Auditoría → Build Ready → Construcción → Validación)
**Responsable de aceptar el resultado:** Alejo Morales

---

## 1. Objeto de la entrega
Sistema web que digitaliza el ciclo completo de solicitud → aprobación → notificación → registro histórico para Permisos, Vacaciones y Adelantos de Nómina, con autenticación por Google, generación de PDF con firma, y un dashboard de trazabilidad para Talento Humano.

## 2. Acceso al sistema
- **URL de producción:** https://sistema-solicitudes-pixel.vercel.app
- **Login:** Google OAuth — cualquier cuenta de Google, restringida a colaboradores dados de alta en Configuración.

## 3. Alcance entregado

| Módulo | Estado | Notas |
|---|---|---|
| Autenticación (Google OAuth) | ✅ Entregado | Multi-Workspace (pixel-g.com y pxl-g.com) |
| Solicitud de Permiso | ✅ Entregado | Crear, editar y cancelar en Pendiente |
| Solicitud de Vacaciones | ✅ Entregado | Con advertencia de 45 días |
| Solicitud de Adelanto de Nómina | ✅ Entregado | Sin ejecución de pagos (solo registro) |
| Bandeja de aprobación | ✅ Entregado | Motivo de rechazo obligatorio |
| Generación de PDF | ✅ Entregado | Formato corporativo con logo, al momento de la decisión |
| Notificaciones por correo | ✅ Entregado | Dominio verificado `pxl-g.com`, probado en vivo |
| Dashboard e historial | ✅ Entregado | Filtros: colaborador, tipo, estado, rango de fechas |
| Configuración de colaboradores | ✅ Entregado | Alta individual + importación masiva por Excel |
| Datos iniciales | ✅ Cargados | 20 colaboradores reales de Pixel Graphic |
| Despliegue continuo | ✅ Activo | Push a `main` → despliegue automático en Vercel |

## 4. Documentación entregada
Toda la documentación vive en `/docs` dentro del repositorio:
- `00-encuadre/` — problema y alcance original
- `01-prd/` — producto, alcance del MVP, criterios de aceptación
- `02-sdd/` — arquitectura, modelo de datos, reglas de negocio
- `03-artefactos/` — mapa de módulos, diagramas de flujo
- `04-construccion/` — backlog técnico
- `05-decisiones/` — auditoría pre-código, Build Ready, **limitaciones conocidas**
- `06-operacion/` — **manual de usuario**, **guía de despliegue**, **changelog**, este acta

## 5. Pendientes explícitos (no bloquean el uso del sistema)
Ver detalle completo en `docs/05-decisiones/limitaciones-conocidas.md`. Resumen:
- Asignar manualmente el rol "Líder de área" a los colaboradores reales que correspondan (el import de Excel no asigna roles).
- Validar en vivo el login con una cuenta real `@pxl-g.com` (se probó exhaustivamente con Gmail personal).
- Si en el futuro se recupera el acceso al DNS de `pixel-g.com`, se puede verificar también ese dominio en Resend.

## 6. Incidente de seguridad detectado y resuelto durante la entrega
Se encontró que las API keys de Resend quedaron expuestas temporalmente en un archivo de configuración local versionado por error. Se resolvió: rotación inmediata de la clave, remoción del archivo del control de versiones, y verificación de que ningún otro secreto quedara expuesto. Ver commit `d6e39b8`.

## 7. Aceptación
Este documento certifica que el sistema fue revisado y probado en vivo con datos reales por Alejo Morales, cubriendo el flujo completo de los 3 tipos de solicitud con al menos dos usuarios distintos (colaborador y líder de aprobación).

Firma / aceptación: ___________________________  Fecha: ___________
