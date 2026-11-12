-- Observaciones del líder: se pueden dejar siempre, al aprobar o al rechazar.
-- En un rechazo se guarda el mismo texto del motivo (que sigue siendo obligatorio).
alter table solicitud
  add column if not exists observaciones_lider text
  check (observaciones_lider is null or char_length(observaciones_lider) <= 1000);
