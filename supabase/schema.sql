-- ============================================================================
-- Esquema SQL - Sistema de reservas de cabañas (Supabase / Postgres)
-- ============================================================================
-- Orden de ejecución: este archivo está pensado para correrse de arriba hacia
-- abajo, tal cual, en el SQL Editor de Supabase. Las secciones respetan
-- dependencias (extensiones -> tablas -> índices -> triggers -> RLS -> datos).
-- Podés pegar el archivo completo de una sola vez.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0) Extensiones necesarias
-- ----------------------------------------------------------------------------
-- pgcrypto: para gen_random_uuid()
-- btree_gist: necesaria para poder usar EXCLUDE USING gist con una columna
--             uuid (cabana_id) combinada con un daterange. gist por sí solo
--             no sabe comparar igualdad de uuid; btree_gist le agrega esa
--             capacidad ("operator class" gist para tipos btree comunes).
create extension if not exists pgcrypto;
create extension if not exists btree_gist;


-- ----------------------------------------------------------------------------
-- 1) Tabla cabanas
-- ----------------------------------------------------------------------------
create table if not exists cabanas (
  id                          uuid primary key default gen_random_uuid(),
  nombre                      text not null,
  -- Controla si esta cabaña suma en los totales combinados de la pantalla
  -- "Resumen general" (Cabaña 1 + Cabaña 2). Cabañas especiales (por ejemplo
  -- una de uso familiar, no de alquiler) se pueden excluir poniendo esto en
  -- false, sin tocar código: siguen teniendo su propio calendario y resumen
  -- individual igual que cualquier otra.
  incluir_en_resumen_general boolean not null default true,
  created_at                 timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 2) Tabla reservas
-- ----------------------------------------------------------------------------
create table if not exists reservas (
  id              uuid primary key default gen_random_uuid(),
  cabana_id       uuid not null references cabanas(id) on delete cascade,
  check_in        date not null,
  check_out       date not null,
  huesped_nombre  text not null,
  personas        int not null default 1,
  total           numeric(12,2) not null default 0,
  sena            numeric(12,2) not null default 0, -- seña / adelanto pagado
  estado_pago     text not null default 'pendiente'
                    check (estado_pago in ('pendiente', 'sena', 'pagado')),
  notas           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint check_out_posterior_a_check_in check (check_out > check_in),

  -- ------------------------------------------------------------------------
  -- Anti-solapamiento de reservas (la parte más delicada del esquema)
  -- ------------------------------------------------------------------------
  -- Qué hace: convierte cada reserva en un rango de fechas [check_in, check_out)
  -- con daterange(check_in, check_out, '[)') -- el '[)' significa "incluye
  -- check_in, excluye check_out", que es justo el comportamiento que queremos
  -- para hotelería: si una reserva termina el día 10, otra puede empezar el
  -- día 10 (no se pisan una noche).
  --
  -- La restricción EXCLUDE USING gist dice: "para filas con el mismo
  -- cabana_id (comparado por igualdad, gracias a btree_gist), el daterange
  -- de check_in/check_out no puede solaparse (&&) con el de ninguna otra fila
  -- existente". Postgres lo garantiza a nivel de base de datos (no depende de
  -- que la app haga bien la validación), y lo chequea en cada INSERT/UPDATE.
  --
  -- Si alguien intenta crear una reserva de la Cabaña 1 del 5 al 10 cuando ya
  -- existe una del 8 al 12 para la misma cabaña, el INSERT falla con un error
  -- de tipo "conflicting key value violates exclusion constraint".
  constraint reservas_sin_solapamiento
    exclude using gist (
      cabana_id with =,
      daterange(check_in, check_out, '[)') with &&
    )
);


-- ----------------------------------------------------------------------------
-- 3) Índice para acelerar consultas del calendario
-- ----------------------------------------------------------------------------
create index if not exists idx_reservas_cabana_fechas
  on reservas (cabana_id, check_in, check_out);


-- ----------------------------------------------------------------------------
-- 4) Trigger para actualizar updated_at automáticamente
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reservas_updated_at on reservas;

create trigger trg_reservas_updated_at
  before update on reservas
  for each row
  execute function set_updated_at();


-- ----------------------------------------------------------------------------
-- 5) Row Level Security
-- ----------------------------------------------------------------------------
-- Por ahora: una sola política simple por tabla que habilita todas las
-- operaciones (select/insert/update/delete) a cualquier usuario autenticado.
-- Se puede reemplazar más adelante por políticas más finas (por ejemplo,
-- restringir por rol o por propietario).

alter table cabanas enable row level security;
alter table reservas enable row level security;

drop policy if exists "authenticated_full_access" on cabanas;
create policy "authenticated_full_access"
  on cabanas
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated_full_access" on reservas;
create policy "authenticated_full_access"
  on reservas
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ----------------------------------------------------------------------------
-- 6) Datos iniciales
-- ----------------------------------------------------------------------------
insert into cabanas (nombre, incluir_en_resumen_general)
values
  ('Cabaña 1', true),
  ('Cabaña 2', true);


-- ----------------------------------------------------------------------------
-- 7) Tabla costos (gastos del negocio)
-- ----------------------------------------------------------------------------
create table if not exists costos (
  id             uuid primary key default gen_random_uuid(),

  -- NULL = costo compartido entre ambas cabañas. Con valor = costo específico
  -- de esa cabaña. on delete cascade: si se borra una cabaña, se van con ella
  -- sus costos específicos (no los compartidos, que no referencian ninguna).
  cabana_id      uuid references cabanas(id) on delete cascade,

  categoria      text not null
                   check (categoria in ('Impuestos', 'Sueldos', 'Servicios', 'Mantenimiento', 'Insumos', 'Otro')),
  descripcion    text not null,
  monto          numeric(12,2) not null check (monto >= 0),

  es_recurrente  boolean not null default false,
  -- Solo tiene sentido cuando es_recurrente = true; el constraint de abajo lo obliga.
  frecuencia     text check (frecuencia in ('mensual', 'anual')),

  -- Puntuales: la fecha del gasto. Recurrentes: la fecha en que empezó a aplicar.
  fecha          date not null,
  -- Solo para recurrentes que en algún momento se cancelan. NULL = sigue vigente.
  fecha_fin      date,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint costos_frecuencia_coherente check (
    (es_recurrente = false and frecuencia is null)
    or (es_recurrente = true and frecuencia is not null)
  ),
  constraint costos_fecha_fin_posterior check (fecha_fin is null or fecha_fin >= fecha)
);

create index if not exists idx_costos_cabana_fecha on costos (cabana_id, fecha);
create index if not exists idx_costos_recurrentes on costos (es_recurrente, fecha, fecha_fin);

drop trigger if exists trg_costos_updated_at on costos;
create trigger trg_costos_updated_at
  before update on costos
  for each row
  execute function set_updated_at();

alter table costos enable row level security;

drop policy if exists "authenticated_full_access" on costos;
create policy "authenticated_full_access"
  on costos
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ----------------------------------------------------------------------------
-- 8) Función: total de costos aplicables a un rango de fechas
-- ----------------------------------------------------------------------------
-- calcular_costos_rango(desde, hasta, cabana_id, incluir_compartidos)
--
-- Por qué función y no vista: una vista no puede recibir parámetros (el
-- rango de fechas cambia según lo que el usuario esté mirando en pantalla).
--
-- Parámetros:
--   p_desde / p_hasta       -- rango de fechas a evaluar (inclusive).
--   p_cabana_id             -- si se pasa, incluye los costos específicos de
--                              esa cabaña.
--   p_incluir_compartidos   -- si es true (default), suma también los costos
--                              con cabana_id NULL (compartidos). Para el
--                              resumen individual de una cabaña se llama con
--                              false, así esos costos NO se descuentan ahí.
--
-- La parte delicada: costos puntuales vs. recurrentes
-- -----------------------------------------------------
-- Puntual: se cuenta el monto una sola vez, entero, si su `fecha` cae dentro
-- de [p_desde, p_hasta].
--
-- Recurrente mensual: se cobra una vez por cada mes calendario en el que el
-- costo está vigente (ya empezó y todavía no terminó) Y que además cae
-- dentro del rango pedido. Para contar esos meses sin un loop, se genera una
-- serie de fechas con paso de 1 mes: desde el mes más tardío entre "cuándo
-- empezó el costo" y "el arranque del rango pedido", hasta el mes más
-- temprano entre "cuándo terminó (o el final del rango, si sigue activo)" y
-- "el final del rango pedido". La cantidad de fechas que genera esa serie es
-- la cantidad de meses a cobrar.
--
-- Ejemplo: costo mensual desde el 15 de marzo (sin fecha_fin), consultado
-- para el rango abril-junio -> arranca en abril (más tardío entre marzo y
-- abril), llega hasta junio (más temprano entre "sigue activo" y junio) ->
-- genera abril, mayo, junio = 3 meses -> el monto se cuenta 3 veces.
--
-- Recurrente anual: la misma lógica, pero contando años calendario en vez de
-- meses.
create or replace function calcular_costos_rango(
  p_desde date,
  p_hasta date,
  p_cabana_id uuid default null,
  p_incluir_compartidos boolean default true
)
returns numeric
language sql
stable
as $$
  with costos_filtrados as (
    select *
    from costos
    where
      (
        (p_cabana_id is not null and cabana_id = p_cabana_id)
        or (p_incluir_compartidos and cabana_id is null)
      )
      and (
        (not es_recurrente and fecha between p_desde and p_hasta)
        or (es_recurrente and fecha <= p_hasta and (fecha_fin is null or fecha_fin >= p_desde))
      )
  )
  select coalesce(sum(
    case
      when not es_recurrente then monto

      when es_recurrente and frecuencia = 'mensual' then
        monto * (
          select count(*)
          from generate_series(
            date_trunc('month', greatest(fecha, p_desde)),
            date_trunc('month', least(coalesce(fecha_fin, p_hasta), p_hasta)),
            interval '1 month'
          )
        )

      when es_recurrente and frecuencia = 'anual' then
        monto * (
          select count(*)
          from generate_series(
            date_trunc('year', greatest(fecha, p_desde)),
            date_trunc('year', least(coalesce(fecha_fin, p_hasta), p_hasta)),
            interval '1 year'
          )
        )

      else 0
    end
  ), 0)
  from costos_filtrados;
$$;
