# Prode Mundial 2026 — Estados Unidos · Canada · Mexico
> App de prode para el Mundial 2026. Desarrollada por Juan Sebastian Makkos y Mauricio Laganga.

---

## Stack Actual

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js 22 + Express.js (JavaScript puro, sin TypeScript) |
| Base de Datos | PostgreSQL via Supabase |
| Auth | Custom JWT + bcrypt (tabla `login_users`) |
| Orquestación | Docker Compose (opcional) |

---

## Cambios Recientes (Marzo 2026)

### Refactor completo del Backend (TypeScript → JavaScript)
- Se eliminó TypeScript del backend. Ahora corre con Node.js puro (`node src/index.js`).
- Se eliminaron `tsconfig.json`, la carpeta `dist/` y todas las dependencias de TS del backend.
- Estructura reorganizada: `backend/src/config/`, `backend/src/controllers/`, `backend/src/routes/`.

### Sistema de Autenticación Personalizado
- **Se reemplazó Supabase Auth** por autenticación propia con tabla `login_users`.
- Registro (`POST /api/auth/signup`): valida datos, hashea contraseña con `bcrypt`, guarda en DB.
- Login (`POST /api/auth/login`): verifica credenciales, devuelve token JWT válido 24 horas.
- El frontend (signup y login) ahora hace `fetch` al backend local en lugar de llamar a Supabase directamente.

### Nuevo Proyecto de Supabase
- Se migró a un nuevo proyecto de Supabase (`uhxhqbqmlurlxtydvqad`).
- La conexión al pool usa la IP directa del Session Pooler para evitar problemas de resolución DNS en entornos WSL.
- **Nota para tu compañero:** configurar el `.env` en `backend/` con los valores del nuevo proyecto (ver sección abajo).

### Limpieza del repositorio
- Se eliminaron carpetas redundantes de la raíz: `tests/`, `lib/`.
- El `package-lock.json` raíz fue eliminado (cada sub-proyecto tiene el suyo).
- Se agregaron `backend/node_modules/` y `frontend/node_modules/` al `.gitignore`.

---

## Estructura del Proyecto

```
prode-off-topic-mundial-2026/
├── backend/                 # Servidor Express (Node.js)
│   ├── src/
│   │   ├── config/db.js     # Pool de conexión a PostgreSQL
│   │   ├── controllers/     # authController.js
│   │   ├── routes/          # auth.js
│   │   ├── index.js         # Entry point del servidor (puerto 3001)
│   │   └── migrate.js       # Script para crear tablas en DB
│   ├── .env                 # ⚠️ NO se sube al repo (ver abajo)
│   └── package.json
├── frontend/                # Next.js App
│   ├── app/
│   │   ├── auth/login/      # Página de login (usa backend)
│   │   ├── auth/signup/     # Página de registro (usa backend)
│   │   └── dashboard/       # Panel principal (WIP)
│   └── package.json
├── supabase/
│   ├── schema.sql           # Schema completo
│   └── migrations/
│       └── 20260323_login_users.sql  # Tabla de usuarios
├── docker-compose.yml       # Orquestación opcional
└── package.json             # Scripts raíz (backend:start, frontend:dev)
```

---

## Cómo levantar el proyecto

### 1. Clonar y configurar variables de entorno

```bash
git clone <repo-url>
cd prode-off-topic-mundial-2026
```

Crear el archivo **`backend/.env`** con estos valores (pedirle a Mauri o Sebas las keys):

```env
# API externa de fútbol
FOOTBALL_API_KEY=tu-api-key
FOOTBALL_API_URL=https://v3.football.api-sports.io

# Supabase (nuevo proyecto - uhxhqbqmlurlxtydvqad)
NEXT_PUBLIC_SUPABASE_URL=https://uhxhqbqmlurlxtydvqad.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-del-proyecto>
SUPABASE_DB_PASSWORD=<password-de-la-db>

# Conexión directa a DB (Session Pooler - evita problemas DNS en WSL)
DB_HOST=44.238.118.41
DB_USER=postgres.uhxhqbqmlurlxtydvqad
DATABASE_URL=postgresql://postgres.uhxhqbqmlurlxtydvqad:<password>@44.238.118.41:5432/postgres

# JWT
JWT_SECRET=super-secret-key-mundial-2026
```

### 2. Crear la tabla de usuarios en Supabase

Ir a Supabase > SQL Editor y ejecutar:

```sql
CREATE TABLE IF NOT EXISTS public.login_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

O correr el archivo `supabase/migrations/20260323_login_users.sql`.

### 3. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Levantar los servidores

Desde la raíz del proyecto:

```bash
# Terminal 1 - Backend (puerto 3001)
npm run backend:start

# Terminal 2 - Frontend (puerto 3000)
npm run frontend:dev
```

Abrir http://localhost:3000

> **Nota:** En la primera vez puede ser conveniente correr `npm run frontend:build && npm run frontend:start` si `next dev` tarda mucho (problema conocido de Turbopack + WSL).

---

## Scripts disponibles (raíz)

| Script | Descripción |
|---|---|
| `npm run backend:start` | Levanta el servidor Express en puerto 3001 |
| `npm run backend:dev` | Levanta el backend con nodemon (hot reload) |
| `npm run frontend:dev` | Levanta Next.js en modo desarrollo (puerto 3000) |

---

## Deploy

### Frontend (Vercel)
Agregar variables de entorno en el dashboard de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend
Pendiente de definir plataforma (Railway, Render, Fly.io, etc.).

---

## Próximos pasos (WIP)
- [ ] Dashboard post-login con partidos y predicciones
- [ ] API de partidos integrada con Football API
- [ ] Lógica de puntuación y ranking
- [ ] Login con Google (OAuth configurado en ambos lados)
