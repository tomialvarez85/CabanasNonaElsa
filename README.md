# Gestión de Cabañas

Sistema interno (2 usuarios) para gestionar reservas de 2 cabañas: calendario mensual,
vista lista, resumen de ocupación/facturación y login con Supabase Auth.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth)
- Deploy: Vercel

## Correr el proyecto localmente

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.local.example .env.local
   ```

3. Completar `.env.local` con los datos de tu proyecto de Supabase (ver sección
   siguiente).

4. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app queda disponible en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Solo hacen falta estas dos (ambas públicas, van al bundle del cliente porque
empiezan con `NEXT_PUBLIC_`; el acceso a datos está protegido por RLS en Supabase,
no por mantenerlas secretas):

| Variable                       | Dónde encontrarla                                                    |
| ------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → tu proyecto → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → tu proyecto → Project Settings → API → anon public |

## Base de datos

Antes del primer uso, correr en el SQL Editor de Supabase, en este orden:

1. `supabase/schema.sql` — crea las tablas, constraints, RLS y las 2 cabañas.
2. `supabase/seed.sql` (opcional) — carga las reservas de la temporada de ejemplo.

Los usuarios (los 2 dueños) se crean a mano desde **Authentication → Users → Add user**
en el dashboard de Supabase; no hay registro público.

## Deploy en Vercel

1. Pushear el repo a GitHub (ver pasos abajo).
2. En [vercel.com](https://vercel.com), importar el repositorio.
3. En **Settings → Environment Variables** del proyecto en Vercel, cargar
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los mismos valores
   que en `.env.local`.
4. Deploy. Cada push a la rama principal vuelve a deployar automáticamente.
