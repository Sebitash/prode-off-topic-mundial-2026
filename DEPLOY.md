# Deploy en Railway — Prode Mundial 2026

Este proyecto se despliega como **monorepo en Railway** con 2 servicios (backend y frontend) que comparten el mismo repo de GitHub, más la base de datos en **Supabase** (Postgres ya existente, no hace falta crearla en Railway).

```
┌─────────────────────┐      ┌──────────────────────┐      ┌────────────────────┐
│  Railway: frontend   │ ───> │  Railway: backend     │ ───> │  Supabase Postgres  │
│  Next.js (puerto     │ HTTP │  Express (puerto      │  TCP │  (ya existe)        │
│  asignado por        │      │  asignado por         │      │                     │
│  Railway vía $PORT)  │      │  Railway vía $PORT)   │      │                     │
└─────────────────────┘      └──────────────────────┘      └────────────────────┘
```

---

## 0. Antes de empezar — Seguridad

Las credenciales reales (password de Supabase, `JWT_SECRET`) **NO deben estar en el repo**. Verificá:

- `.env`, `backend/.env`, `frontend/.env` están en `.gitignore` (ya lo están) y **no están trackeados por git** (ya verificado: `git ls-files | grep env` no devuelve nada).
- Nunca pegues estos valores en commits, issues o PRs públicos.

Como las credenciales actuales circularon en este chat/sesión, se recomienda **rotar el password de la base de datos en Supabase** (Project Settings → Database → Reset password) y generar un `JWT_SECRET` nuevo antes de pasar a producción. Un `JWT_SECRET` fuerte se puede generar así:

```bash
openssl rand -base64 48
```

Vas a usar las credenciales nuevas únicamente como **variables de entorno en Railway** (nunca en archivos del repo).

---

## 1. Base de datos (Supabase)

La base ya existe en Supabase, no hay que "deployarla" — solo correr las migraciones pendientes.

1. Entrá a tu proyecto en https://supabase.com/dashboard → **SQL Editor**.
2. Ejecutá (en orden, si no se corrieron antes) los archivos de `supabase/migrations/`:
   - `20260225_groups_teams_matches.sql`
   - `20260323_login_users.sql`
   - `20260403_game_schema.sql`
   - `20260403_teams_groups_data.sql`
   - `20260609_world_cup_2026_fixture.sql` (fixture completo del Mundial 2026: 48 equipos, 72 partidos, vista `teams_simple`)
3. Si preferís correrlas desde la terminal con `backend/src/migrate.js`, recordá que ese script apunta a un único archivo hardcodeado — para correr otra migración hay que editar temporalmente la línea del `path.join(...)` con el archivo deseado, y necesitás `SUPABASE_DB_PASSWORD` en `backend/.env`.
4. Anotá (de tu proyecto Supabase, Project Settings → Database):
   - **Connection string / host** (lo vas a usar como `DATABASE_URL` / `DB_HOST` del backend)
   - **Project URL** y **anon public key** (Project Settings → API) — son `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` del frontend.

---

## 2. Crear el proyecto en Railway

1. Entrá a https://railway.app → **New Project** → **Deploy from GitHub repo** → elegí este repositorio.
2. Railway va a crear un primer servicio detectando el repo. Lo vamos a configurar como **backend** (ver paso 3) y luego agregamos un segundo servicio para el **frontend** con **+ New → GitHub Repo** (mismo repo de nuevo).

Al final deberías tener 2 servicios dentro del mismo proyecto Railway, ambos apuntando al mismo repo pero con distinto **Root Directory**.

---

## 3. Servicio Backend

En **Settings** del servicio backend:

- **Root Directory**: `backend`
- **Builder**: Dockerfile (Railway detecta `backend/Dockerfile` y `backend/railway.json` automáticamente)
- **Watch Paths** (opcional, para que solo redeploye si cambia el backend): `backend/**`

### Variables de entorno (tab "Variables")

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | host de tu Postgres de Supabase (ej. `44.238.118.41` o el host actual del pooler) |
| `DB_USER` | usuario de Postgres de Supabase (ej. `postgres.uhxhqbqmlurlxtydvqad`) |
| `SUPABASE_DB_PASSWORD` | password **rotado** de la base |
| `DATABASE_URL` | connection string completa de Supabase (con el password nuevo, URL-encoded) |
| `JWT_SECRET` | secreto nuevo generado con `openssl rand -base64 48` |
| `ADMIN_EMAILS` | email(s) con acceso a `/admin` para cargar resultados, separados por coma (ej. `vos@gmail.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase. Necesaria para validar el login con Google |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key de Supabase. Necesaria para validar el login con Google |

> Railway asigna `PORT` automáticamente — no hace falta definirlo, `backend/src/index.js` ya usa `process.env.PORT || 3001`.

### Generar dominio público

En **Settings → Networking → Generate Domain**. Vas a obtener algo como `https://prode-backend-production.up.railway.app`. **Copiá esta URL**, la necesitás para el frontend.

### Verificar

Una vez deployado: `https://<tu-backend>.up.railway.app/health` debe responder `{"status":"ok", ...}`.

---

## 4. Servicio Frontend

En **Settings** del servicio frontend:

- **Root Directory**: `frontend`
- **Builder**: Dockerfile (Railway detecta `frontend/Dockerfile` y `frontend/railway.json`)
- **Watch Paths** (opcional): `frontend/**`

### Variables de entorno (tab "Variables")

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública del backend del paso 3 (ej. `https://prode-backend-production.up.railway.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key de Supabase |

> **Importante**: las variables `NEXT_PUBLIC_*` se incrustan en el build de Next.js (no son solo runtime). El `frontend/Dockerfile` ya declara `ARG`/`ENV` para estas 3 variables — Railway las pasa automáticamente como build args si están definidas como Variables del servicio. Si cambiás alguna, hay que **redeployar** (no alcanza con reiniciar) para que se regenere el build.

### Generar dominio público

En **Settings → Networking → Generate Domain**. Esta es la URL pública de la app (ej. `https://prode-frontend-production.up.railway.app`).

### Verificar

Abrí la URL del frontend, deberías ver la página de login/dashboard. Probá login, `/matches`, `/predictions`.

---

## 4.1 Login con Google (Supabase Auth)

El botón "Continuar con Google" usa Supabase Auth para el OAuth y un endpoint propio (`POST /api/auth/google`) que crea/vincula el usuario en `login_users` y emite el JWT de la app.

1. **Google Cloud Console** → APIs & Services → Credentials → tu OAuth Client (Web application):
   - **Authorized JavaScript origins**: agregá la URL del proyecto Supabase (`https://dkcnxdpjycoosxcxckor.supabase.co`) y la URL del frontend en Railway.
   - **Authorized redirect URIs**: `https://dkcnxdpjycoosxcxckor.supabase.co/auth/v1/callback`.
2. **Supabase Dashboard** → Authentication → Providers → Google:
   - Activar el provider y pegar **Client ID** y **Client Secret** (los del paso anterior). Esto NO va en el repo ni en Railway, solo en Supabase.
3. En Railway, servicio **backend** → Variables → agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mismos valores que el frontend, ver tabla de variables del backend más arriba) y redeployar.
4. **Supabase Dashboard** → Authentication → URL Configuration:
   - **Site URL**: URL del frontend en Railway.
   - **Redirect URLs**: agregar `https://<tu-frontend>.up.railway.app/auth/callback` y `https://<tu-frontend>.up.railway.app/**`.

### Verificar

Click en "Continuar con Google" desde `/auth/login` → autorizás con tu cuenta de Google → te redirige a `/auth/callback` → `/auth/google-bridge` → `/dashboard`. Si falla, revisar los Deploy Logs del backend buscando `Google Auth Error`.

---

## 5. Fase eliminatoria (después del 27/06/2026)

Las llaves de octavos/cuartos/semis/final dependen de las posiciones finales de grupos. Una vez cerrada la fase de grupos:
1. Determinar los cruces usando `teams_simple` (1°/2° de cada grupo) + la tabla de mejores terceros.
2. Crear una nueva migración `supabase/migrations/<fecha>_world_cup_2026_knockout.sql` con los 32 partidos de eliminatorias (`stage` distinto de `'Group Stage'`, ej. `'Round of 32'`, `'Round of 16'`, `'Quarter-finals'`, `'Semi-finals'`, `'Final'`).
3. Correrla en Supabase SQL Editor (paso 1.2).

---

## 6. Checklist final

- [ ] Migraciones corridas en Supabase (incluyendo la nueva del fixture cuando esté lista)
- [ ] `SUPABASE_DB_PASSWORD` rotado y `JWT_SECRET` nuevo generado
- [ ] Servicio backend en Railway: deploy OK, `/health` responde, variables configuradas
- [ ] Servicio frontend en Railway: deploy OK, `NEXT_PUBLIC_API_URL` apunta al backend, login funciona
- [ ] `/matches`, `/predictions`, "Tablas de Posiciones" cargan sin error 500
- [ ] Probar que una predicción se puede guardar (>1h antes del partido) y que se bloquea (<1h antes), con el mensaje "Cerrado" en la UI
