-- Faltaban las políticas de UPDATE para las tablas de detalle.
-- Sin ellas, un UPDATE se ejecuta "exitosamente" pero afecta 0 filas
-- (RLS lo filtra en silencio, sin lanzar error) — bug descubierto al
-- probar en vivo la edición de una solicitud pendiente.

create policy detalle_permiso_update
  on solicitud_permiso for update
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and s.colaborador_id = fn_mi_colaborador_id()
        and s.estado = 'pendiente'
    )
  )
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and s.colaborador_id = fn_mi_colaborador_id()
        and s.estado = 'pendiente'
    )
  );

create policy detalle_vacaciones_update
  on solicitud_vacaciones for update
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and s.colaborador_id = fn_mi_colaborador_id()
        and s.estado = 'pendiente'
    )
  )
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and s.colaborador_id = fn_mi_colaborador_id()
        and s.estado = 'pendiente'
    )
  );

create policy detalle_nomina_update
  on solicitud_nomina for update
  to authenticated
  using (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and s.colaborador_id = fn_mi_colaborador_id()
        and s.estado = 'pendiente'
    )
  )
  with check (
    exists (
      select 1 from solicitud s
      where s.id = solicitud_id
        and s.colaborador_id = fn_mi_colaborador_id()
        and s.estado = 'pendiente'
    )
  );
