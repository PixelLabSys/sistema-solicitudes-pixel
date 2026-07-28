# Inventario de accesos — Sistema de Solicitudes PIXEL GRAPHIC

Dónde vive cada pieza de infraestructura y quién administra el acceso. **No contiene contraseñas ni claves** — esas viven exclusivamente en el gestor de cada plataforma y en las variables de entorno de Vercel.

| Servicio | Para qué se usa | Cuenta / Organización | Dónde se administra |
|---|---|---|---|
| GitHub | Código fuente (repositorio público) | Organización `PixelLabSys` | github.com/PixelLabSys/sistema-solicitudes-pixel |
| Vercel | Hosting y despliegue continuo | Equipo "Pixel" (plan Hobby) | vercel.com → proyecto `sistema-solicitudes-pixel` |
| Supabase | Base de datos, autenticación, storage | Proyecto `pixel-solicitudes` | supabase.com/dashboard |
| Resend | Envío de correos transaccionales | Cuenta `lab@pixel-g.com` | resend.com |
| Google Cloud | Cliente OAuth para "Iniciar sesión con Google" | Proyecto "Sistema Solicitudes Pixel" | console.cloud.google.com |
| Dominio pxl-g.com | DNS para verificación de correo (Resend) | GoDaddy, acceso vía Google Admin (reseller) | admin.google.com → Dominios → Gestionar dominios |

## Variables de entorno activas (nombres, no valores)
Configuradas en Vercel (Project Settings → Environment Variables) y replicadas en `.env.local` para desarrollo:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (segura de exponer — protegida por Row Level Security)
- `RESEND_API_KEY` (secreta — rotar si se sospecha exposición)

## Migraciones de base de datos
`supabase/migrations/` en el repositorio, aplicadas manualmente vía SQL Editor de Supabase (no hay CLI de Supabase configurado). Ver `docs/06-operacion/despliegue.md` para el detalle de cada una.

## Notas de seguridad
- El repositorio de GitHub es **público** desde 2026-07-28 (necesario para superar una restricción de colaboración del plan Hobby de Vercel). No contiene secretos vigentes: las claves que quedaron expuestas por error en el historial fueron rotadas de inmediato.
- Cualquier clave nueva (Resend, Supabase, Google) debe ir siempre a variables de entorno — nunca a archivos versionados, ni siquiera a `.claude/settings.local.json` (ya está en `.gitignore`).
