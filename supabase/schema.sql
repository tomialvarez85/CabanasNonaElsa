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
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  created_at timestamptz not null default now()
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
insert into cabanas (nombre)
values ('Cabaña 1'), ('Cabaña 2');
