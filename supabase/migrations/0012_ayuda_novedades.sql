-- Módulo Ayuda: recuerda qué versión de las novedades vio cada colaborador.
alter table colaborador add column if not exists ayuda_version_vista text;

-- colaborador solo es editable por TH; esta función deja que cada persona
-- actualice únicamente su propia marca de "novedad vista".
create or replace function fn_marcar_ayuda_vista(p_version text)
returns void
language sql
security definer
set search_path = public
as $$
  update colaborador
  set ayuda_version_vista = p_version
  where auth_user_id = auth.uid();
$$;

grant execute on function fn_marcar_ayuda_vista(text) to authenticated;
