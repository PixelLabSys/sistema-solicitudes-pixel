-- Corte: soporte adjunto en Permiso, vacaciones mixtas, catálogos de
-- área/cargo, y múltiples Líderes de TH (feedback post-entrega).

-- ============================================================
-- 1. Soporte adjunto (Permiso)
-- ============================================================
alter table solicitud_permiso add column soporte_url text;

insert into storage.buckets (id, name, public)
values ('soportes', 'soportes', false)
on conflict (id) do nothing;

create policy soportes_insert_autenticados
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'soportes');

create policy soportes_select_autenticados
  on storage.objects for select
  to authenticated
  using (bucket_id = 'soportes');

-- ============================================================
-- 2. Vacaciones mixtas
-- ============================================================
alter table solicitud_vacaciones drop constraint if exists solicitud_vacaciones_tipo_vacaciones_check;
alter table solicitud_vacaciones add constraint solicitud_vacaciones_tipo_vacaciones_check
  check (tipo_vacaciones in ('compensadas', 'disfrutadas', 'mixtas'));

alter table solicitud_vacaciones add column dias_compensados numeric;
alter table solicitud_vacaciones add constraint chk_dias_compensados
  check (dias_compensados is null or (dias_compensados between 1 and 30));
alter table solicitud_vacaciones add constraint chk_mixtas_requiere_dias
  check (tipo_vacaciones <> 'mixtas' or dias_compensados is not null);

-- ============================================================
-- 3. Catálogos de Área y Cargo
-- ============================================================
create table area (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table cargo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table area enable row level security;
alter table cargo enable row level security;

create policy area_select_autenticados on area for select to authenticated using (true);
create policy area_insert_autenticados on area for insert to authenticated with check (true);
create policy area_update_th on area for update to authenticated
  using (fn_soy_lider_th()) with check (fn_soy_lider_th());

create policy cargo_select_autenticados on cargo for select to authenticated using (true);
create policy cargo_insert_autenticados on cargo for insert to authenticated with check (true);
create policy cargo_update_th on cargo for update to authenticated
  using (fn_soy_lider_th()) with check (fn_soy_lider_th());

-- Nota: solicitud_vacaciones.area / cargo_actual y solicitud_nomina.cargo
-- siguen siendo texto libre (no FK) a propósito: el catálogo alimenta el
-- desplegable, pero cada solicitud congela el nombre tal como estaba el
-- día que se radicó — si luego se renombra o desactiva un área/cargo en
-- el catálogo, el historial no cambia.

-- ============================================================
-- 4. Múltiples Líderes de TH (redundancia / respaldo)
-- ============================================================
drop index if exists colaborador_unico_lider_th;
