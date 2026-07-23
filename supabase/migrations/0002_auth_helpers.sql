-- Helpers de arranque de Auth (Magic Link)

-- Valida un correo contra la lista blanca ANTES de iniciar sesión (llamable sin auth).
-- No expone el resto de columnas de colaborador a usuarios anónimos.
create or replace function fn_correo_autorizado(p_correo text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from colaborador
    where correo = lower(p_correo) and activo = true
  );
$$;

grant execute on function fn_correo_autorizado(text) to anon, authenticated;

-- Vincula el colaborador (por correo) con el usuario de auth.users recién autenticado.
-- Solo vincula si el correo coincide y aún no tiene auth_user_id asignado.
create or replace function fn_vincular_colaborador()
returns void
language plpgsql
security definer
as $$
declare
  v_correo text;
begin
  v_correo := lower(coalesce(auth.jwt() ->> 'email', ''));
  if v_correo = '' then
    return;
  end if;

  update colaborador
  set auth_user_id = auth.uid()
  where correo = v_correo
    and activo = true
    and auth_user_id is null;
end;
$$;

grant execute on function fn_vincular_colaborador() to authenticated;
