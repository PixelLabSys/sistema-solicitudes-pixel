# Manual de usuario — Sistema de Solicitudes PIXEL GRAPHIC

## Acceso
Entra a **https://sistema-solicitudes-pixel.vercel.app** y haz clic en "Iniciar sesión con Google". Cualquier cuenta de Google funciona (personal o de Workspace) — el sistema solo te deja entrar si Talento Humano te agregó previamente en Configuración. Si tu correo no está registrado, verás el mensaje "Tu cuenta de Google no tiene acceso al sistema".

## Radicar una solicitud (todo colaborador)
1. En el menú lateral, elige **Nueva: Permiso**, **Nueva: Vacaciones** o **Nueva: Adelanto**.
2. Llena el formulario. El **líder de proceso** se elige de un desplegable con los líderes de área activos — puedes elegir uno distinto cada vez, según el caso.
3. Adjunta tu **firma** (imagen JPG/JPEG, máx. 2MB) — es obligatoria.
4. Envía. El sistema asigna el consecutivo automáticamente (SP-####, SV-#### o SN-####).

**Vacaciones**: si radicas con menos de 45 días de anticipación, verás una advertencia pero puedes continuar — la decisión final la toman tu líder y Talento Humano.

## Mientras tu solicitud está "Pendiente"
En **Mis solicitudes** puedes:
- **Editar**: cambia cualquier campo (la firma es opcional — si no subes una nueva, se conserva la anterior).
- **Cancelar**: la retira definitivamente, sin necesidad de que nadie la apruebe o rechace.

Una vez el líder decide (Aprobada/Rechazada), la solicitud queda inmutable — ya no se puede editar ni cancelar.

## Aprobar o rechazar (líderes de área)
En **Bandeja de aprobación** ves las solicitudes donde te eligieron como líder de proceso.
- **Aprobar**: un clic. Genera el PDF final y notifica al colaborador y a Talento Humano.
- **Rechazar**: requiere escribir un motivo obligatorio antes de confirmar.

## Dashboard (líderes de área y Talento Humano)
- Un líder de área ve las solicitudes donde **él** fue elegido como líder de proceso (no un equipo fijo).
- El Líder de Talento Humano ve **todas** las solicitudes de la empresa.
- Filtros disponibles: colaborador, tipo, estado, y rango de fechas.
- Cada solicitud decidida (aprobada/rechazada) tiene un botón **Ver** para descargar/abrir el PDF con la firma y el resultado.

## Configuración (solo Líder de Talento Humano)
- **Alta individual**: formulario con Nombre completo, Correo, CC.
- **Importar desde Excel**: sube un archivo `.xlsx`/`.csv` con columnas **Nombre Completo**, **Correo**, **CC** (los encabezados no distinguen mayúsculas/acentos). El sistema reporta cuántos se crearon y cuáles se saltaron (y por qué).
- **Roles**: marca/desmarca "Líder de área" o "Líder de TH" con las casillas. Solo puede haber un Líder de TH activo a la vez.
- **Desactivar/quitar rol**: si el colaborador tiene solicitudes **pendientes** asignadas como líder, el sistema bloquea la acción hasta que se resuelvan.
- "Desactivar" nunca borra al colaborador — solo lo marca inactivo (no puede iniciar sesión, pero su historial se conserva).

## Notificaciones por correo
Se envían automáticamente desde `notificaciones@pxl-g.com`:
- Al líder, cuando le radican una solicitud.
- Al colaborador, cuando su solicitud es aprobada o rechazada (con el motivo si aplica).
- Al Líder de Talento Humano, cuando una solicitud es aprobada.

Si un envío falla (ej. problema temporal del proveedor de correo), la solicitud sigue su curso normal — el correo no es un requisito para que el flujo funcione, solo un aviso adicional.
