-- Agrega Área y Cargo actual a la Solicitud de Permiso, igual que en Vacaciones
-- (feedback post-entrega). Nullable porque las solicitudes de permiso ya
-- existentes no tenían este dato; las nuevas lo exigen desde la app.
alter table solicitud_permiso add column area text;
alter table solicitud_permiso add column cargo_actual text;
