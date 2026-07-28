# Despliegue y operación — Sistema de Solicitudes PIXEL GRAPHIC

## Infraestructura

| Componente | Proveedor | Notas |
|---|---|---|
| Hosting / CI-CD | Vercel (proyecto `pixel-f1a7/sistema-solicitudes-pixel`) | Despliega automáticamente en cada push a `main` |
| Repositorio | GitHub (`PixelLabSys/sistema-solicitudes-pixel`, privado) | Conectado a Vercel vía GitHub App |
| Base de datos, Auth, Storage | Supabase (proyecto `pixel-solicitudes`) | Postgres + RLS + Storage (`firmas`, `pdfs`) |
| Envío de correo | Resend (cuenta `lab@pixel-g.com`) | Dominio verificado: `pxl-g.com` |
| Auth social | Google Cloud (proyecto "Sistema Solicitudes Pixel") | OAuth Client tipo Web, consentimiento en modo Externo |

## URL de producción
**https://sistema-solicitudes-pixel.vercel.app**

## Variables de entorno (Vercel → Project Settings → Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`

Las mismas variables están en `.env.local` para desarrollo local (no versionado en git).

## Cómo desplegar un cambio
```bash
git add -A
git commit -m "mensaje"
git push
```
Vercel construye y despliega automáticamente en unos 30-60 segundos. Se puede seguir el progreso en vercel.com → proyecto → pestaña Deployments.

## Cómo revertir un despliegue
En el dashboard de Vercel → Deployments → elegir un despliegue anterior → **Promote to Production**. No borra el código, solo cambia cuál build sirve el dominio de producción.

## Migraciones de base de datos
Viven en `supabase/migrations/`, en orden:
1. `0001_init.sql` — esquema completo (tablas, RLS, triggers, storage).
2. `0002_auth_helpers.sql` — funciones de vinculación de auth y validación de correo.
3. `0003_seed_bootstrap.sql` — alta del primer colaborador (Líder de TH inicial).
4. `0004_update_detalle_policies.sql` — políticas de UPDATE para las tablas de detalle (corrección de bug).

Para aplicar una migración nueva: pegar el SQL en el **SQL Editor** de Supabase y ejecutar. No hay CLI de Supabase configurado en este proyecto — el flujo de trabajo actual es manual vía dashboard.

## Autenticación de terceros configurada
- **Google OAuth**: proyecto propio de Google Cloud, consentimiento "Externo" (no "Interno") porque los colaboradores usan dos Workspaces de Google distintos sin relación entre sí (`pixel-g.com` y `pxl-g.com`). La lista blanca real de acceso es la tabla `colaborador` de la base de datos, no una restricción de Google.
- **Redirect URI autorizado en Google Cloud**: `https://ibtfkuqijahfkfgwvrrl.supabase.co/auth/v1/callback` (fijo, no cambia aunque cambie el dominio de la app).
- **Redirect URLs permitidas en Supabase Auth** (Authentication → URL Configuration): debe incluir tanto `http://localhost:3000/auth/callback` (desarrollo) como `https://sistema-solicitudes-pixel.vercel.app/auth/callback` (producción).

## Backups
Supabase realiza backups automáticos diarios en el plan actual, con retención limitada (ver panel de Supabase → Database → Backups para el detalle vigente del plan).
