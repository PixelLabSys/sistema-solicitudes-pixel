# Mapa mental de módulos — Sistema de Solicitudes PIXEL GRAPHIC

```mermaid
mindmap
  root((Sistema de Solicitudes<br/>PIXEL GRAPHIC))
    Auth
      Google OAuth
      Lista blanca de correos
      Bloqueo si no autorizado
    Solicitudes
      Permisos
        Colaborador crea
        Elige lider del despliegue por solicitud
        Datos: fechas, horas, tipo, descripcion, firma
      Vacaciones
        Colaborador crea
        Elige lider del despliegue por solicitud
        Advertencia 45 dias
      Adelanto de Nomina
        Colaborador crea
        Elige lider del despliegue por solicitud
        Solo registro, sin pago real
    Aprobaciones
      Bandeja del lider de area
      Aprobar
      Rechazar con motivo obligatorio
      Notifica al colaborador
    Notificaciones
      Email via Resend
      Radicacion
      Decision
      Aviso a Lider TH
    Generacion PDF
      Formato final por tipo
      Firma incrustada
      Storage privado
    Dashboard
      Lider de area: su equipo
      Lider TH: toda la empresa
      Filtros: colaborador, tipo, estado, fecha
    Configuracion
      Alta o baja de colaboradores
      Asignar o desasignar lider de area
      Elegir Lider de TH
      Solo accesible por Lider TH
    Futuro fuera de alcance
      Aprobacion multinivel
      Integracion nomina o ERP
      Firma dibujada en pantalla
      Exportacion de reportes
```

## Notas
- Los 3 tipos de solicitud comparten el mismo ciclo (Auth → Solicitudes → Aprobaciones → Notificaciones → PDF → Dashboard), solo cambian los campos propios de cada formulario.
- Configuración es el único módulo exclusivo del Líder de TH.
- Dashboard tiene dos vistas con el mismo componente pero alcance de datos distinto según rol (RLS ya definido en el SDD).
