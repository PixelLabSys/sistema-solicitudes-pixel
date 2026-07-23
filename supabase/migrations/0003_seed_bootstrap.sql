-- Bootstrap: primer colaborador y Líder de Talento Humano.
-- Ejecutar una sola vez. Ajusta nombre y CC si lo deseas.

insert into colaborador (nombre_completo, correo, cc, es_lider_area, es_lider_th, activo)
values ('Alejo Morales', 'alejomoraleslab@gmail.com', '0000000000', true, true, true)
on conflict (correo) do nothing;
