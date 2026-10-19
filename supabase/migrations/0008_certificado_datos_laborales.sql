-- Corte 1 de Certificado Laboral: género y datos laborales por colaborador

-- El género no es sensible; colaborador ya es legible por todos los autenticados.
alter table colaborador
  add column if not exists genero text
  check (genero in ('masculino', 'femenino'));

-- Datos de contrato y salario: tabla aparte porque colaborador es legible por todos.
create table if not exists colaborador_contrato (
  colaborador_id uuid primary key references colaborador(id) on delete cascade,
  fecha_ingreso date not null,
  tipo_contrato text not null
    check (tipo_contrato in ('indefinido', 'fijo', 'obra_labor', 'aprendizaje')),
  salario numeric(14, 0) not null check (salario >= 0),
  actualizado_en timestamptz not null default now()
);

alter table colaborador_contrato enable row level security;

-- El propio colaborador ve sus datos; el Líder de TH ve y administra todos.
create policy contrato_select_propio
  on colaborador_contrato for select
  to authenticated
  using (colaborador_id = fn_mi_colaborador_id());

create policy contrato_select_th
  on colaborador_contrato for select
  to authenticated
  using (fn_soy_lider_th());

create policy contrato_insert_th
  on colaborador_contrato for insert
  to authenticated
  with check (fn_soy_lider_th());

create policy contrato_update_th
  on colaborador_contrato for update
  to authenticated
  using (fn_soy_lider_th())
  with check (fn_soy_lider_th());

-- El aprobador de un certificado leerá estos datos en el Corte 3, cuando exista
-- la tabla de certificados; esa política se agrega en su propia migración.
