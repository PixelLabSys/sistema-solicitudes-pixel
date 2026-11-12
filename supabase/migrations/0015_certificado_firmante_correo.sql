-- Correo de cada firmante: sale en el bloque de la firma del certificado.
alter table certificado_firmante add column if not exists correo text;

-- Quien firma hoy (Gestión del Talento) usaba el correo fijo del área.
update certificado_firmante
set correo = 'gestiondeltalento@pixel-g.com'
where correo is null;
