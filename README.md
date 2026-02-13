# Prode Mundial 2026 Estados unidos - Canada - Mexico
## By Juan Sebastian Makkos 
App de prode para el Mundial 2026 hecha con Next.js 14 y Supabase.

## Que tiene

- Registro e inicio de sesion con Supabase Auth.
- Tablero con estadisticas.
- Partidos, predicciones y ranking.
- Diseno responsive.

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase

## Como correrlo

1) Instalar dependencias

```bash
npm install
```

2) Crear .env.local en la raiz

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Los valores salen de Supabase > Settings > API.

3) Crear tablas

Ejecuta el SQL de `supabase/schema.sql` en el editor de Supabase.

4) Levantar el proyecto

```bash
npm run dev
```

Abrir http://localhost:3000

## Deploy

En Vercel agrega las variables de entorno y redeploy.

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

