-- ============================================================================
-- Migración: módulo de Costos (gastos del negocio)
-- ============================================================================
-- Para bases que ya tienen supabase/schema.sql aplicado. Si estás creando la
-- base desde cero, no hace falta correr esto: ya está incluido en schema.sql.
--
-- Correr manualmente en el SQL Editor de Supabase. Es seguro correrlo más de
-- una vez (usa IF NOT EXISTS / OR REPLACE / DROP...IF EXISTS en todos lados).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) Tabla costos
-- ----------------------------------------------------------------------------
create table if not exists costos (
  id             uuid primary key default gen_random_uuid(),

  -- NULL = costo compartido entre ambas cabañas. Con valor = costo específico
  -- de esa cabaña puntual (ej. arreglo de algo que rompió el huésped de la
  -- Cabaña 2). on delete cascade: si se borra una cabaña, se van con ella sus
  -- costos específicos (no los compartidos, que no referencian ninguna).
  cabana_id      uuid references cabanas(id) on delete cascade,

  categoria      text not null
                   check (categoria in ('Impuestos', 'Sueldos', 'Servicios', 'Mantenimiento', 'Insumos', 'Otro')),
  descripcion    text not null,
  monto          numeric(12,2) not null check (monto >= 0),

  es_recurrente  boolean not null default false,
  -- Solo tiene sentido cuando es_recurrente = true; el constraint de abajo lo
  -- obliga.
  frecuencia     text check (frecuencia in ('mensual', 'anual')),

  -- Puntuales: la fecha del gasto. Recurrentes: la fecha en que empezó a aplicar.
  fecha          date not null,
  -- Solo para recurrentes que en algún momento se cancelan/dejan de aplicar.
  -- NULL = sigue vigente hoy.
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


-- ----------------------------------------------------------------------------
-- 2) updated_at automático
-- ----------------------------------------------------------------------------
-- Reutiliza la función set_updated_at() que ya crea supabase/schema.sql para
-- la tabla reservas. Si por algún motivo no existe todavía en tu base
-- (por ejemplo corriste esta migración antes que esa parte del schema),
-- descomentá el bloque de abajo.

-- create or replace function set_updated_at()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;

drop trigger if exists trg_costos_updated_at on costos;
create trigger trg_costos_updated_at
  before update on costos
  for each row
  execute function set_updated_at();


-- ----------------------------------------------------------------------------
-- 3) Row Level Security
-- ----------------------------------------------------------------------------
-- Misma política que el resto de las tablas: cualquier usuario autenticado
-- puede hacer cualquier operación.
alter table costos enable row level security;

drop policy if exists "authenticated_full_access" on costos;
create policy "authenticated_full_access"
  on costos
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ----------------------------------------------------------------------------
-- 4) Función: total de costos aplicables a un rango de fechas
-- ----------------------------------------------------------------------------
-- calcular_costos_rango(desde, hasta, cabana_id, incluir_compartidos)
--
-- Por qué función y no vista: una vista no puede recibir parámetros (el
-- rango de fechas cambia según lo que el usuario esté mirando en pantalla),
-- así que necesita ser una función.
--
-- Parámetros:
--   p_desde / p_hasta       -- rango de fechas a evaluar (inclusive).
--   p_cabana_id             -- si se pasa, incluye los costos específicos de
--                              esa cabaña. Si es NULL, no filtra por cabaña
--                              específica (solo trae compartidos, salvo que
--                              p_incluir_compartidos sea false).
--   p_incluir_compartidos   -- si es true (default), suma también los costos
--                              con cabana_id NULL (compartidos). Para el
--                              resumen individual de una cabaña se llama con
--                              false, así esos costos NO se descuentan ahí
--                              (solo aparecen en el Resumen General).
--
-- La parte delicada: costos puntuales vs. recurrentes
-- -----------------------------------------------------
-- Puntual (es_recurrente = false): se sabe si "aplica" con una sola
-- comparación -- su `fecha` cae entre p_desde y p_hasta. Se cuenta el monto
-- una sola vez, entero.
--
-- Recurrente mensual (es_recurrente = true, frecuencia = 'mensual'): un
-- gasto fijo (por ejemplo un sueldo) se cobra una vez por cada mes calendario
-- en el que está vigente. "Vigente" significa: ya empezó (>= fecha) y
-- todavía no terminó (fecha_fin es NULL, o fecha_fin >= ese mes). Hay que
-- contar cuántos de esos meses cae DENTRO del rango [p_desde, p_hasta] que
-- pidió el usuario, y multiplicar el monto por esa cantidad.
--
-- Para contar los meses sin escribir un loop a mano, se genera una serie de
-- fechas (generate_series) con paso de 1 mes:
--   - el punto de arranque es el mes más tardío entre "cuándo empezó el
--     costo" (fecha) y "el arranque del rango pedido" (p_desde) -- porque no
--     nos interesan meses anteriores a ninguno de los dos.
--   - el punto de llegada es el mes más temprano entre "cuándo terminó el
--     costo, o hoy si sigue activo" (fecha_fin, o si es NULL usamos p_hasta)
--     y "el final del rango pedido" (p_hasta) -- por la misma razón, en
--     sentido contrario.
--   - contamos cuántas fechas generó esa serie: esa cantidad es la cantidad
--     de meses que hay que cobrar.
--
-- Ejemplo: un costo recurrente mensual que arrancó el 15 de marzo (sin
-- fecha_fin, sigue activo) y se consulta el rango abril-junio: el punto de
-- arranque es abril (más tardío entre marzo y abril), el de llegada es junio
-- (más temprano entre "hoy/sin fin" y junio) -> genera abril, mayo, junio =
-- 3 meses -> el monto se cuenta 3 veces.
--
-- Recurrente anual: exactamente la misma lógica, pero contando años
-- calendario en vez de meses.
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
      -- Alcance: costos específicos de la cabaña pedida y/o los compartidos.
      (
        (p_cabana_id is not null and cabana_id = p_cabana_id)
        or (p_incluir_compartidos and cabana_id is null)
      )
      -- Solo traemos filas que puedan llegar a solapar el rango pedido.
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
