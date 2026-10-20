-- Rol con el que sale cada persona en el certificado, y firma por persona:
-- en cada certificado firma quien lo aprueba (Ana Paola o, cuando ella lo pide, el Líder General).

alter table colaborador_contrato add column if not exists rol text;

create table if not exists certificado_firmante (
  colaborador_id uuid primary key references colaborador(id) on delete cascade,
  cargo text not null check (length(trim(cargo)) > 0),
  telefono text not null check (length(trim(telefono)) > 0),
  firma_path text not null,
  actualizado_en timestamptz not null default now()
);

alter table certificado_firmante enable row level security;

-- TH ve todas las firmas; una persona solo ve la suya y solo mientras tiene
-- un certificado pendiente asignado para aprobar.
create policy certificado_firmante_select
  on certificado_firmante for select
  to authenticated
  using (
    fn_soy_lider_th()
    or (
      colaborador_id = fn_mi_colaborador_id()
      and exists (
        select 1 from solicitud s
        where s.tipo = 'certificado'
          and s.estado = 'pendiente'
          and s.lider_aprobador_id = fn_mi_colaborador_id()
      )
    )
  );

create policy certificado_firmante_insert_th
  on certificado_firmante for insert
  to authenticated
  with check (fn_soy_lider_th());

create policy certificado_firmante_update_th
  on certificado_firmante for update
  to authenticated
  using (fn_soy_lider_th())
  with check (fn_soy_lider_th());

-- El cargo inicial venía del ejemplo de la carta; el correcto es Líder de Gestión del Talento.
update certificado_config
set firmante_cargo = 'Líder de Gestión del Talento'
where firmante_cargo = 'Líder de Gestión del Ser';

-- Conserva la firma que ya estaba configurada para quien firma hoy.
insert into certificado_firmante (colaborador_id, cargo, telefono, firma_path)
select c.firmante_id, c.firmante_cargo, c.firmante_telefono, f.firma_path
from certificado_config c
cross join certificado_firma f
where c.firmante_id is not null
  and c.firmante_cargo is not null
  and c.firmante_telefono is not null
on conflict (colaborador_id) do nothing;

-- La función ahora también devuelve el rol; cambia su forma de salida, por eso se recrea.
drop function if exists fn_datos_certificado(uuid);

create function fn_datos_certificado(p_solicitud_id uuid)
returns table (fecha_ingreso date, tipo_contrato text, salario numeric, rol text)
language sql
security definer
stable
set search_path = public
as $$
  select c.fecha_ingreso,
         c.tipo_contrato,
         case when sc.incluir_salario then c.salario else null end,
         c.rol
  from solicitud s
  join solicitud_certificado sc on sc.solicitud_id = s.id
  join colaborador_contrato c on c.colaborador_id = s.colaborador_id
  where s.id = p_solicitud_id
    and s.tipo = 'certificado'
    and s.estado = 'pendiente'
    and (s.lider_aprobador_id = fn_mi_colaborador_id() or fn_soy_lider_th());
$$;

grant execute on function fn_datos_certificado(uuid) to authenticated;
