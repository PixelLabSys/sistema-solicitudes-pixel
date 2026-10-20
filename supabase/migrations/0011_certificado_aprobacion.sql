-- Corte 3 de Certificado Laboral: firma del certificado y lectura controlada de datos laborales.

alter table certificado_config
  add column if not exists firmante_cargo text,
  add column if not exists firmante_telefono text;

update certificado_config
set firmante_cargo = coalesce(firmante_cargo, 'Líder de Gestión del Talento'),
    firmante_telefono = coalesce(firmante_telefono, '319-3219221')
where id;

-- La imagen de la firma va en una tabla aparte: certificado_config es legible por todos
-- los empleados y la firma solo debe verla TH o quien aprueba un certificado pendiente.
create table if not exists certificado_firma (
  id boolean primary key default true check (id),
  firma_path text not null,
  actualizado_en timestamptz not null default now()
);

alter table certificado_firma enable row level security;

create policy certificado_firma_select
  on certificado_firma for select
  to authenticated
  using (
    fn_soy_lider_th()
    or exists (
      select 1 from solicitud s
      where s.tipo = 'certificado'
        and s.estado = 'pendiente'
        and s.lider_aprobador_id = fn_mi_colaborador_id()
    )
  );

create policy certificado_firma_insert_th
  on certificado_firma for insert
  to authenticated
  with check (fn_soy_lider_th());

create policy certificado_firma_update_th
  on certificado_firma for update
  to authenticated
  using (fn_soy_lider_th())
  with check (fn_soy_lider_th());

-- El aprobador necesita fecha de ingreso, tipo de contrato y (solo si el colaborador
-- lo pidió) el salario. Una política sobre la tabla no puede ocultar columnas, así que
-- se expone una función que devuelve el salario solo cuando corresponde, y solo mientras
-- la solicitud está pendiente y la consulta el aprobador asignado o un Líder de TH.
create or replace function fn_datos_certificado(p_solicitud_id uuid)
returns table (fecha_ingreso date, tipo_contrato text, salario numeric)
language sql
security definer
stable
set search_path = public
as $$
  select c.fecha_ingreso,
         c.tipo_contrato,
         case when sc.incluir_salario then c.salario else null end
  from solicitud s
  join solicitud_certificado sc on sc.solicitud_id = s.id
  join colaborador_contrato c on c.colaborador_id = s.colaborador_id
  where s.id = p_solicitud_id
    and s.tipo = 'certificado'
    and s.estado = 'pendiente'
    and (s.lider_aprobador_id = fn_mi_colaborador_id() or fn_soy_lider_th());
$$;

grant execute on function fn_datos_certificado(uuid) to authenticated;
