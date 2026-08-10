-- Ajustes solicitados por la compañía tras la segunda presentación:
-- nuevos tipos de permiso, y rol de Líder General para enrutar Adelantos.

-- 1. Nuevos tipos de permiso: Escolar y Judicial
alter table solicitud_permiso drop constraint if exists solicitud_permiso_tipo_permiso_check;
alter table solicitud_permiso add constraint solicitud_permiso_tipo_permiso_check
  check (tipo_permiso in ('medico', 'personal', 'escolar', 'judicial'));

-- 2. Rol de Líder General: recibe automáticamente las solicitudes de
--    Adelanto de Nómina para aprobación. Solo puede haber uno a la vez
--    (a diferencia de Líder de TH, que sí admite varios).
alter table colaborador add column es_lider_general boolean not null default false;

create unique index colaborador_unico_lider_general
  on colaborador (es_lider_general)
  where es_lider_general;
