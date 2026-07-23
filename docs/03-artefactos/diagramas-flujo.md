# Diagrama de flujo con carriles por actor — Ciclo de una Solicitud

```mermaid
flowchart TD
    subgraph COL["Colaborador"]
        A1[Inicia sesion con Google]
        A2{Correo en lista blanca?}
        A3[Acceso denegado]
        A4{Hay lideres de area configurados?}
        A5[Bloqueado: contactar a TH]
        A6[Llena formulario y elige lider del desplegable]
        A7[Sube firma JPG/JPEG]
        A8[Envia solicitud]
        A9[Recibe email con decision]
    end

    subgraph SYS["Sistema"]
        B1{Vacaciones: menos de 45 dias?}
        B2[Marca advertencia, permite continuar]
        B3[Genera consecutivo unico]
        B4[Crea registro Pendiente con lider elegido]
        B5[Envia email al lider elegido]
        B6[Genera PDF con firma]
        B7[Guarda PDF en Storage]
        B8[Actualiza estado y bitacora]
        B9[Envia email de decision al colaborador]
        B10{Fue aprobada?}
        B11[Envia email al Lider de TH]
        B12[Visible en Dashboard]
    end

    subgraph LID["Lider de area"]
        C1[Recibe email de nueva solicitud]
        C2[Revisa en bandeja de aprobacion]
        C3{Aprueba?}
        C4[Aprueba]
        C5[Rechaza]
        C6{Escribio motivo?}
        C7[Bloquea envio: motivo obligatorio]
    end

    subgraph TH["Lider de Talento Humano"]
        D1[Recibe email de solicitud aprobada]
        D2[Consulta Dashboard historico]
    end

    A1 --> A2
    A2 -- No --> A3
    A2 -- Si --> A4
    A4 -- No --> A5
    A4 -- Si --> A6
    A6 --> A7
    A7 --> A8
    A8 --> B1
    B1 -- Si, es vacaciones --> B2 --> B3
    B1 -- No aplica --> B3
    B3 --> B4
    B4 --> B6
    B6 --> B7
    B4 --> B5
    B5 --> C1
    C1 --> C2
    C2 --> C3
    C3 -- Si --> C4
    C3 -- No --> C5
    C5 --> C6
    C6 -- No --> C7
    C7 --> C5
    C6 -- Si --> B8
    C4 --> B8
    B8 --> B9
    B9 --> A9
    B8 --> B10
    B10 -- Si --> B11
    B11 --> D1
    B10 -- Si o No --> B12
    D1 --> D2
```

## Casos alternativos y de error cubiertos
- Correo fuera de la lista blanca → acceso denegado, sin crear sesión.
- No hay líderes de área configurados → bloqueado antes de poder enviar el formulario (el líder se elige por solicitud, no es un dato fijo del colaborador).
- Vacaciones radicadas con menos de 45 días de anticipación → advertencia visible, no bloqueo (decisión conjunta líder + TH ya en PRD).
- Rechazo sin motivo → el sistema no permite confirmar el rechazo hasta que se escriba el motivo.
- Toda decisión (aprobada o rechazada) queda en `SOLICITUD_EVENTO` y es visible en el Dashboard correspondiente según rol.
