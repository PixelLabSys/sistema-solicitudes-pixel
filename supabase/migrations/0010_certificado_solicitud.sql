-- Corte 2 de Certificado Laboral, paso 2 de 2 (requiere 0009 ya ejecutada).

create sequence if not exists seq_sc; -- Solicitud de Certificado

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
    when 'certificado' then
      v_prefijo := 'SC';
      v_num := nextval('seq_sc');
  end case;
  return v_prefijo || '-' || lpad(v_num::text, 4, '0');
end;
$$;

-- Configuración única del certificado: quién aprueba y firma.
create table if not exists certificado_config (
  id boolean primary key default true check (id),
  firmante_id uuid references colaborador(id),
  actualizado_en timestamptz not null default now()
);

alter table certificado_config enable row level security;

create policy certificado_config_select
  on certificado_config for select
  to authenticated
  using (true);

create policy certificado_config_insert_th
  on certificado_config for insert
  to authenticated
  with check (fn_soy_lider_th());

create policy certificado_config_update_th
  on certificado_config for update
  to authenticated
  using (fn_soy_lider_th())
  with check (fn_soy_lider_th());

insert into certificado_config (id, firmante_id)
select true, id from colaborador
where nombre_completo ilike 'Ana Paola V%squez' and activo
limit 1
on conflict (id) do nothing;

-- Detalle de la solicitud de certificado.
create table if not exists solicitud_certificado (
  solicitud_id uuid primary key references solicitud(id) on delete cascade,
  destinatario text not null check (length(trim(destinatario)) > 0),
  cargo text not null check (length(trim(cargo)) > 0),
  motivo text not null check (length(trim(motivo)) > 0),
  incluir_salario boolean not null default false
);

alter table solicitud_certificado enable row level security;

create policy detalle_certificado_select
  on solicitud_certificado for select
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

create policy detalle_certificado_insert
  on solicitud_certificado for insert
  to authenticated
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id and s.colaborador_id = fn_mi_colaborador_id()
    )
  );
