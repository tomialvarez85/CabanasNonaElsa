-- ============================================================================
-- Seed de reservas - Temporada Nov 2026 / Feb 2027
-- ============================================================================
-- Pensado para correrse DESPUÉS de supabase/schema.sql (necesita que existan
-- las filas 'Cabaña 1' y 'Cabaña 2' en la tabla cabanas).
--
-- IMPORTANTE - dos conflictos de fechas detectados en la planilla original,
-- para la misma cabaña, que NO se pueden cargar juntos porque violan la
-- constraint reservas_sin_solapamiento (exclude using gist):
--
-- 1) Cabaña 1, 18 al 24 ene 2027, "Gonzalo Giorgi" (540000, 7 noches) se
--    solapa con Rocío Weber (15-19 ene) y German Franz (19-22 ene), que ya
--    están cargadas en este seed. Por indicación tuya, Gonzalo Giorgi queda
--    AFUERA de este archivo. Revisá cuál de las dos reservas es la vigente
--    y cargala a mano una vez resuelto.
--
-- 2) Cabaña 1, María Paola Mascotti (2 al 12 feb) y Maria Ortega (2 al 7 feb)
--    también se solapan entre sí (ambas arrancan el 2 de feb). Esto lo
--    encontré yo al revisar los datos que pasaste, no estaba marcado en tu
--    aviso. Las dejo en un INSERT separado, comentado más abajo, para que
--    elijas cuál cargar (o si corresponden a cabañas/fechas distintas en la
--    realidad) antes de ejecutarlo.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Cabaña 1 (sin conflictos de fechas)
-- ----------------------------------------------------------------------------
insert into reservas
  (cabana_id, check_in, check_out, huesped_nombre, personas, total, sena, estado_pago, notas)
values
  ((select id from cabanas where nombre = 'Cabaña 1'), '2026-11-21', '2026-11-24', 'Pablo Videla',          2, 180000, 180000, 'pagado',    null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2026-12-06', '2026-12-08', 'Nadia Suarez',          4, 160000,  62000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2026-12-12', '2026-12-13', 'Mariano Marcioni',      2, 100000,      0, 'pendiente', null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2026-12-24', '2026-12-25', 'Roque Peralta',         4, 100000,  20000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2026-12-27', '2026-12-29', 'Camila Diaz',           2, 160000,  32000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2027-01-02', '2027-01-06', 'Javier Atencio',        3, 340000, 100000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2027-01-07', '2027-01-15', 'José Luis Paredes',     4, 722000, 100000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2027-01-15', '2027-01-19', 'Rocío Weber',           4, 400000,  80000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2027-01-19', '2027-01-22', 'German Franz',          4, 270000, 270000, 'pagado',    null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2027-01-26', '2027-01-29', 'Alejandro Goette',      4, 300000, 100000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 1'), '2027-01-29', '2027-02-02', 'Dario Riffel',          4, 400000,  80000, 'sena',      null);

-- NO incluida (ver aviso arriba): Gonzalo Giorgi, Cabaña 1, 18 al 24 ene 2027,
-- 540000, 7 noches. Se solapa con Rocío Weber y German Franz.


-- ----------------------------------------------------------------------------
-- Cabaña 1 - CONFLICTO: estas dos reservas se solapan entre sí (ambas
-- arrancan el 2027-02-02). Ejecutar este INSERT completo va a fallar por la
-- constraint reservas_sin_solapamiento. Antes de correrlo, comentá/borrá la
-- línea que no corresponda (o corregí la fecha si una de las dos está mal
-- cargada en la planilla original).
-- ----------------------------------------------------------------------------
-- insert into reservas
--   (cabana_id, check_in, check_out, huesped_nombre, personas, total, sena, estado_pago, notas)
-- values
--   ((select id from cabanas where nombre = 'Cabaña 1'), '2027-02-02', '2027-02-12', 'María Paola Mascotti', 3, 850000, 250000, 'sena', 'confirmar apellido completo'),
--   ((select id from cabanas where nombre = 'Cabaña 1'), '2027-02-02', '2027-02-07', 'Maria Ortega',         6, 800000, 180000, 'sena', 'casa abuelo');


-- ----------------------------------------------------------------------------
-- Cabaña 2
-- ----------------------------------------------------------------------------
insert into reservas
  (cabana_id, check_in, check_out, huesped_nombre, personas, total, sena, estado_pago, notas)
values
  ((select id from cabanas where nombre = 'Cabaña 2'), '2026-11-21', '2026-11-24', 'Valeria Steinle',       4,  240000, 240000, 'pagado',    null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2026-12-06', '2026-12-08', 'Nadia Suarez',          4,   80000,      0, 'pendiente', null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2026-12-12', '2026-12-13', 'Pareja am Oncativo',    2,  100000,      0, 'pendiente', null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2026-12-24', '2026-12-25', 'Roque Peralta',         3,  100000,  20000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2026-12-27', '2026-12-28', 'Tomas Gigena',          2,   80000,  16000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2026-12-28', '2026-12-31', 'Santiago Avila',        4,  200000,  56000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2027-01-03', '2027-01-06', 'Nadia Mana',            2,  225000,      0, 'pendiente', null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2027-01-07', '2027-01-15', 'José Luis Paredes',     3,  722000, 100000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2027-01-15', '2027-01-18', 'De Juncos Alejo',       2,  240000,  48000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2027-01-18', '2027-02-01', 'Norma Escobar',         2, 1120000, 224000, 'sena',      null),
  ((select id from cabanas where nombre = 'Cabaña 2'), '2027-02-07', '2027-02-10', 'Mariano Monzon',        4,  300000,  60000, 'sena',      null);
