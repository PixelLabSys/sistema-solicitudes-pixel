-- Sistema de Solicitudes PIXEL GRAPHIC — esquema inicial
-- Basado en docs/02-sdd/arquitectura.md (post auditoría Opus)

create extension if not exists "pgcrypto";

-- ============================================================
-- COLABORADOR
-- ============================================================
create table colaborador (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  nombre_completo text not null,
  correo text not null unique,
  cc text not null,
  es_lider_area boolean not null default false,
  es_lider_th boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- Solo puede haber un Líder de TH activo a la vez (hallazgo M1 de la auditoría)
create unique index colaborador_unico_lider_th
  on colaborador (es_lider_th)
  where es_lider_th;

comment on column colaborador.auth_user_id is
  'Vínculo con auth.users, poblado al primer login vía Magic Link (hallazgo M3 de la auditoría)';

-- ============================================================
-- SECUENCIAS DE CONSECUTIVO (hallazgo A3: atómicas, nunca max()+1)
-- ============================================================
create sequence seq_sp; -- Solicitud de Permiso
create sequence seq_sv; -- Solicitud de Vacaciones
create sequence seq_sn; -- Solicitud de Nómina (adelanto)

create type tipo_solicitud as enum ('permiso', 'vacaciones', 'nomina');
create type estado_solicitud as enum ('pendiente', 'aprobada', 'rechazada', 'cancelada');

create or replace function generar_consecutivo(p_tipo tipo_solicitud)
returns text
language plpgsql
as $$
declare
  v_prefijo text;
  v_num bigint;
begin
  case p_tipo
    when 'permiso' then
      v_prefijo := 'SP';
      v_num := nextval('seq_sp');
    when 'vacaciones' then
      v_prefijo := 'SV';
      v_num := nextval('seq_sv');
    when 'nomina' then
      v_prefijo := 'SN';
      v_num := nextval('seq_sn');
  end case;
  return v_prefijo || '-' || lpad(v_num::text, 4, '0');
end;
$$;

-- ============================================================
-- SOLICITUD (cabecera común a los 3 tipos)
-- ============================================================
create table solicitud (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_solicitud not null,
  consecutivo text not null unique default null,
  colaborador_id uuid not null references colaborador(id),
  lider_aprobador_id uuid not null references colaborador(id),
  estado estado_solicitud not null default 'pendiente',
  motivo_rechazo text,
  firma_url text,
  pdf_url text,
  creado_en timestamptz not null default now(),
  decidido_en timestamptz,

  -- C2: no autoaprobación
  constraint chk_no_autoaprobacion check (lider_aprobador_id <> colaborador_id),
  -- C2: rechazo requiere motivo
  constraint chk_motivo_rechazo check (
    estado <> 'rechazada' or (motivo_rechazo is not null and motivo_rechazo <> '')
  )
);

create index solicitud_colaborador_idx on solicitud (colaborador_id);
create index solicitud_lider_idx on solicitud (lider_aprobador_id);
create index solicitud_estado_idx on solicitud (estado);

-- Asignar consecutivo automáticamente al insertar
create or replace function fn_asignar_consecutivo()
returns trigger
language plpgsql
as $$
begin
  if new.consecutivo is null then
    new.consecutivo := generar_consecutivo(new.tipo);
  end if;
  return new;
end;
$$;

create trigger trg_asignar_consecutivo
  before insert on solicitud
  for each row execute function fn_asignar_consecutivo();

-- C2: inmutabilidad real — nada se modifica si el estado previo no es 'pendiente'
create or replace function fn_bloquear_edicion_no_pendiente()
returns trigger
language plpgsql
as $$
begin
  if old.estado <> 'pendiente' then
    raise exception 'La solicitud % ya no está pendiente (estado actual: %); no puede modificarse.',
      old.consecutivo, old.estado;
  end if;
  return new;
end;
$$;

create trigger trg_bloquear_edicion_no_pendiente
  before update on solicitud
  for each row execute function fn_bloquear_edicion_no_pendiente();

-- Marca decidido_en automáticamente al pasar a un estado final de decisión
create or replace function fn_marcar_decidido_en()
returns trigger
language plpgsql
as $$
begin
  if new.estado in ('aprobada', 'rechazada') and old.decidido_en is null then
    new.decidido_en := now();
  end if;
  return new;
end;
$$;

create trigger trg_marcar_decidido_en
  before update on solicitud
  for each row execute function fn_marcar_decidido_en();

-- ============================================================
-- DETALLE POR TIPO
-- ============================================================
create table solicitud_permiso (
  solicitud_id uuid primary key references solicitud(id) on delete cascade,
  fecha_desde date not null,
  fecha_hasta date not null,
  hora_desde time not null,
  hora_hasta time not null,
  dias_concedidos numeric not null default 0,
  horas_concedidas numeric not null default 0,
  tipo_permiso text not null check (tipo_permiso in ('medico', 'personal')),
  descripcion text,

  constraint chk_rango_fechas_permiso check (fecha_hasta >= fecha_desde),
  constraint chk_rango_horas_permiso check (hora_hasta > hora_desde)
);

create table solicitud_vacaciones (
  solicitud_id uuid primary key references solicitud(id) on delete cascade,
  area text not null,
  cargo_actual text not null,
  tipo_vacaciones text not null check (tipo_vacaciones in ('compensadas', 'disfrutadas')),
  fecha_desde date not null,
  fecha_hasta date not null,
  ingreso_a_laborar date not null,
  observaciones text,
  advertencia_45_dias boolean not null default false,

  constraint chk_rango_fechas_vacaciones check (fecha_hasta >= fecha_desde),
  constraint chk_ingreso_despues_descanso check (ingreso_a_laborar > fecha_hasta)
);

create table solicitud_nomina (
  solicitud_id uuid primary key references solicitud(id) on delete cascade,
  cargo text not null,
  tipo_adelanto text not null check (tipo_adelanto in ('nomina', 'prima', 'cuenta_cobro')),
  valor_neto numeric not null check (valor_neto > 0),
  transferencia_bancaria boolean not null default false
);

-- ============================================================
-- EVENTO (bitácora / auditoría — alimenta el dashboard de historial)
-- ============================================================
create table solicitud_evento (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references solicitud(id) on delete cascade,
  evento text not null check (
    evento in ('creada', 'editada', 'cancelada', 'aprobada', 'rechazada',
               'notificada_th', 'email_fallido', 'email_reenviado')
  ),
  actor_id uuid references colaborador(id),
  creado_en timestamptz not null default now()
);

create index solicitud_evento_solicitud_idx on solicitud_evento (solicitud_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table colaborador enable row level security;
alter table solicitud enable row level security;
alter table solicitud_permiso enable row level security;
alter table solicitud_vacaciones enable row level security;
alter table solicitud_nomina enable row level security;
alter table solicitud_evento enable row level security;

-- Helper: colaborador_id del usuario autenticado actual
create or replace function fn_mi_colaborador_id()
returns uuid
language sql
security definer
stable
as $$
  select id from colaborador where auth_user_id = auth.uid();
$$;

create or replace function fn_soy_lider_th()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select es_lider_th from colaborador where auth_user_id = auth.uid()), false);
$$;

-- ---- COLABORADOR ----
-- Cualquier colaborador autenticado puede leer la lista (necesaria para el desplegable de líderes)
create policy colaborador_select_autenticados
  on colaborador for select
  to authenticated
  using (true);

-- Solo el Líder de TH escribe en colaborador (alta/baja, asignar roles)
create policy colaborador_insert_th
  on colaborador for insert
  to authenticated
  with check (fn_soy_lider_th());

create policy colaborador_update_th
  on colaborador for update
  to authenticated
  using (fn_soy_lider_th())
  with check (fn_soy_lider_th());

-- ---- SOLICITUD ----
-- Colaborador: lee solo lo suyo
create policy solicitud_select_propia
  on solicitud for select
  to authenticated
  using (colaborador_id = fn_mi_colaborador_id());

-- Líder de área: lee lo que le fue asignado a aprobar
create policy solicitud_select_lider
  on solicitud for select
  to authenticated
  using (lider_aprobador_id = fn_mi_colaborador_id());

-- Líder de TH: lee todo
create policy solicitud_select_th
  on solicitud for select
  to authenticated
  using (fn_soy_lider_th());

-- Colaborador: crea solo a su propio nombre
create policy solicitud_insert_propia
  on solicitud for insert
  to authenticated
  with check (colaborador_id = fn_mi_colaborador_id());

-- Colaborador: edita/cancela solo lo suyo (trigger ya impide tocar si no está pendiente)
-- Nota: RLS de columna real requiere políticas separadas por rol; aquí se restringe por fila
-- y la restricción de columnas se refuerza en la capa de aplicación (Server Actions).
create policy solicitud_update_propia
  on solicitud for update
  to authenticated
  using (colaborador_id = fn_mi_colaborador_id())
  with check (colaborador_id = fn_mi_colaborador_id());

-- Líder de área: decide (aprobar/rechazar) solo lo que le fue asignado
create policy solicitud_update_lider
  on solicitud for update
  to authenticated
  using (lider_aprobador_id = fn_mi_colaborador_id())
  with check (lider_aprobador_id = fn_mi_colaborador_id());

-- ---- DETALLE (mismo criterio que SOLICITUD, vía join) ----
create policy detalle_permiso_select
  on solicitud_permiso for select
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and (s.colaborador_id = fn_mi_colaborador_id()
             or s.lider_aprobador_id = fn_mi_colaborador_id()
             or fn_soy_lider_th())
    )
  );

create policy detalle_permiso_insert
  on solicitud_permiso for insert
  to authenticated
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id and s.colaborador_id = fn_mi_colaborador_id()
    )
  );

create policy detalle_vacaciones_select
  on solicitud_vacaciones for select
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and (s.colaborador_id = fn_mi_colaborador_id()
             or s.lider_aprobador_id = fn_mi_colaborador_id()
             or fn_soy_lider_th())
    )
  );

create policy detalle_vacaciones_insert
  on solicitud_vacaciones for insert
  to authenticated
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id and s.colaborador_id = fn_mi_colaborador_id()
    )
  );

create policy detalle_nomina_select
  on solicitud_nomina for select
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and (s.colaborador_id = fn_mi_colaborador_id()
             or s.lider_aprobador_id = fn_mi_colaborador_id()
             or fn_soy_lider_th())
    )
  );

create policy detalle_nomina_insert
  on solicitud_nomina for insert
  to authenticated
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id and s.colaborador_id = fn_mi_colaborador_id()
    )
  );

-- ---- SOLICITUD_EVENTO ----
create policy evento_select
  on solicitud_evento for select
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and (s.colaborador_id = fn_mi_colaborador_id()
             or s.lider_aprobador_id = fn_mi_colaborador_id()
             or fn_soy_lider_th())
    )
  );

create policy evento_insert
  on solicitud_evento for insert
  to authenticated
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and (s.colaborador_id = fn_mi_colaborador_id()
             or s.lider_aprobador_id = fn_mi_colaborador_id()
             or fn_soy_lider_th())
    )
  );

-- ============================================================
-- STORAGE (firmas y PDFs — buckets privados, ver SDD §10)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('firmas', 'firmas', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

create policy firmas_insert_autenticados
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'firmas');

create policy firmas_select_autenticados
  on storage.objects for select
  to authenticated
  using (bucket_id = 'firmas');

create policy pdfs_select_autenticados
  on storage.objects for select
  to authenticated
  using (bucket_id = 'pdfs');

create policy pdfs_insert_autenticados
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pdfs');
