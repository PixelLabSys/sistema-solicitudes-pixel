-- Corte 2 de Certificado Laboral, paso 1 de 2.
-- Se ejecuta SOLO, antes de 0010: un valor de enum nuevo no puede usarse
-- en la misma transacción en la que se agrega.
alter type tipo_solicitud add value if not exists 'certificado';
