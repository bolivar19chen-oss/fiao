-- Provincia del cliente. Un cliente solo pide fiado donde compra, y donde compra es
-- cerca de donde vive: la provincia es el filtro.
--
-- Por que provincia y no un radio en kilometros: el directorio de comercios
-- (src/data/stores.ts, permisos sanitarios del MINSA) trae provincia y distrito, no
-- coordenadas. Un radio exige latitud y longitud de cada tienda, y esos datos no los
-- tenemos. Inventarlos seria peor que no tenerlos. Si algun dia entran coordenadas,
-- esta columna se queda y el radio se suma encima.
--
-- Los diez valores son los que aparecen en el listado del MINSA, escritos igual.
-- Nullable: las filas que ya existen no tienen provincia y no hay de donde sacarla.

alter table public.profiles
  add column province text
    check (province is null or province in (
      'BOCAS DEL TORO',
      'COCLÉ',
      'COLÓN',
      'CHIRIQUÍ',
      'DARIÉN',
      'HERRERA',
      'LOS SANTOS',
      'PANAMÁ',
      'PANAMÁ OESTE',
      'VERAGUAS'
    ));

comment on column public.profiles.province is
  'Provincia del cliente, del vocabulario de src/data/stores.ts. Decide que tiendas se le ofrecen.';
