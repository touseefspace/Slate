# Plan: Simple Todo + Notes Stack (Next.js 16 + FastAPI + Firebase Auth + NeonDB + SQLAlchemy)

Design, directory structure, and step-by-step implementation for the Todo and Notes application. Backend is managed with **Astral `uv`**; frontend uses **Tailwind CSS**, **shadcn/ui**, TanStack Query, and native `fetch`.

---

## Tech Stack Overview

1. **Frontend (Next.js 16)**: App Router, TypeScript, **Tailwind CSS v4** (already scaffolded), **shadcn/ui** for accessible primitives (Button, Card, Input, Dialog, Tabs, etc.), plus **supplemental custom CSS** in `globals.css` for theme tokens, subtle animations, and app-specific polish.
2. **Data fetching (TanStack Query + `fetch`)**:
   - **TanStack Query (`@tanstack/react-query`)**: Server-state for todos and notes — caching, background refetch, loading/error states, optimistic updates via `useQuery` / `useMutation`.
   - **Native `fetch`**: Thin API client in `lib/api.ts` with Firebase ID token headers. No axios.
3. **Backend (FastAPI)**: Python via **`uv`**, Pydantic validation, NeonDB via SQLAlchemy.
4. **Database (NeonDB + SQLAlchemy)**: Serverless Postgres; ORM models for `Todo` and `Note`.
5. **Authentication (Firebase Auth)**:
   - **Frontend**: Email/password via Firebase Web SDK.
   - **Backend**: JWT verification via `firebase-admin`.

---

## Current Progress

| Step | Status | Notes |
|------|--------|--------|
| **1. Neon database** | Done | `DATABASE_URL` set in `backend/.env` |
| **2. Firebase project & auth** | Done | Email/password enabled; web app registered |
| **2a. Frontend Firebase config** | Done | `lib/firebase.ts` + `NEXT_PUBLIC_*` in `frontend/.env`; `credentials.ts` removed |
| **2b. Backend Firebase admin** | Done | `app/firebase_init.py` loads `./serviceAccountKey.json` or `SERVICE_ACCOUNT_KEY` JSON |
| **Backend scaffold** | Done | `app/` package with config, database, models, auth dependency, FastAPI `main.py` + `/health` |
| **Frontend scaffold** | Done | shadcn initialized, `AuthContext`, `QueryProvider`, `lib/api.ts`, `useTodos` / `useNotes` hooks |

| **Phase 2 API** | Done | `/todos` and `/notes` CRUD, scoped by Firebase `user_id` |

| **Phase 4 UI** | Done | Auth page, dashboard with todos/notes tabs |

**Next up:** Polish, edit dialogs, or deploy.

---

## Directory Structure (target)

Aligned with what exists today (`frontend/app/` without `src/`) and what we still need to add:

```
todo/
├── backend/
│   ├── app/                      # TODO: create FastAPI package
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── crud/
│   │   ├── routers/
│   │   └── auth/
│   │       └── dependencies.py
│   ├── main.py                   # uvicorn entry: uv run python main.py
│   ├── pyproject.toml            # EXISTS — deps installed
│   ├── uv.lock
│   ├── serviceAccountKey.json    # EXISTS (gitignore)
│   └── .env                      # EXISTS — DATABASE_URL, Firebase, service account
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # EXISTS — add providers
│   │   ├── page.tsx              # EXISTS — replace with auth landing
│   │   ├── globals.css           # EXISTS — Tailwind + shadcn theme + custom tokens
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn primitives (generated)
│   │   ├── auth/                 # AuthCard, etc.
│   │   ├── todos/
│   │   └── notes/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── providers/
│   │   └── QueryProvider.tsx
│   ├── hooks/
│   │   ├── useTodos.ts
│   │   └── useNotes.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── api.ts
│   │   └── utils.ts              # shadcn cn() helper
│   ├── components.json           # shadcn config (after init)
│   ├── package.json
│   └── .env                      # EXISTS — use NEXT_PUBLIC_* naming
│
└── README.md
```

---

## Completed Setup Reference (Steps 1 & 2)

### 1. Neon Database — done

- Project created on Neon; connection string stored as `DATABASE_URL` in `backend/.env`.
- Use the pooled connection string from the Neon dashboard if you enable connection pooling later.

### 2. Firebase Project & Auth — done

- Project: `todo-notes-app-9547d` (or your chosen name).
- Web app registered; Email/Password sign-in enabled.
- **Frontend env** (`frontend/.env`) — prefer this naming:

  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
  NEXT_PUBLIC_FIREBASE_APP_ID=...
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

- **Backend env** (`backend/.env`) — at minimum:

  ```env
  DATABASE_URL=postgresql://...
  # Either path to JSON file OR inline JSON for firebase-admin:
  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
  ```

- Remove hardcoded secrets from `frontend/app/credentials.ts` after migrating to `lib/firebase.ts`.
- Ensure `serviceAccountKey.json` and `.env` are in `.gitignore`.

---

## Styling: Tailwind + shadcn/ui + custom CSS

**Decision:** Use **Tailwind CSS** for layout and utilities, **shadcn/ui** for components, and **custom CSS** only where it adds clear value (design tokens, gradients, glass effects, keyframe animations).

### Tailwind (already in place)

- Tailwind v4 via `@import "tailwindcss"` in `app/globals.css`.
- Use utility classes in pages and feature components; avoid large bespoke CSS files.

### shadcn/ui (to add in Phase 3)

From `frontend/`:

```bash
npx shadcn@latest init
```

- Choose **New York** or **Default** style, **Zinc** (or **Slate**) base color, **CSS variables** for theming.
- Add components as needed:

  ```bash
  npx shadcn@latest add button card input label tabs dialog textarea skeleton toast
  ```

- Generated files live under `components/ui/`; customize via Tailwind classes, not by editing shadcn source unless necessary.

### Custom CSS (`globals.css`)

Keep shadcn’s `@layer base` theme variables and extend with app-specific tokens, for example:

- CSS variables for accent glow / glass surfaces (`--glass-bg`, `--accent-glow`).
- `@keyframes` for fade-in or list item entrance.
- Small overrides that are awkward in pure utilities (e.g. scrollbar, focus rings).

**Do not** rebuild the UI in raw CSS — compose shadcn + Tailwind first, then layer custom CSS for branding.

---

## Frontend API Layer (TanStack Query + `fetch`)

### `lib/api.ts`

- `apiFetch(path, options, getToken)` — prefix `NEXT_PUBLIC_API_URL`, set `Authorization: Bearer <idToken>`, parse JSON, throw on non-OK responses.
- Typed helpers: `getTodos`, `createTodo`, `updateTodo`, `deleteTodo`, and note equivalents.

### `hooks/useTodos.ts` / `hooks/useNotes.ts`

- `useQuery` with keys `['todos']` / `['notes']`, `enabled: !!user`.
- `useMutation` + `queryClient.invalidateQueries` on success; optional optimistic updates.

### `providers/QueryProvider.tsx`

- `QueryClient` defaults: e.g. `staleTime: 30_000`, `retry: 1`.
- Wrap app in root `layout.tsx` alongside `AuthProvider`.

---

## Proposed Implementation Steps

### Phase 1: Backend Setup with Astral `uv` — in progress

**Already done:** `uv` project, `pyproject.toml` with `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `firebase-admin`, `pydantic-settings`.

**Remaining:**

1. Create `backend/app/` package structure (`config.py`, `database.py`, models, schemas, crud, routers).
2. Wire `app/main.py` with CORS, health check, and router includes.
3. Fix `firebase.py` to load credentials from `GOOGLE_APPLICATION_CREDENTIALS` or `SERVICE_ACCOUNT_KEY` env (no absolute `/serviceAccountKey.json`).
4. Define SQLAlchemy models `Todo` and `Note` (`user_id` from Firebase UID, timestamps).
5. Run migrations or `Base.metadata.create_all` for initial dev schema.
6. Entry command: `uv run uvicorn app.main:app --reload --port 8000`.

### Phase 2: Firebase Auth & Securing Endpoints

1. `app/auth/dependencies.py` — `verify_id_token` from `Authorization: Bearer` header.
2. Routers: `GET/POST/PATCH/DELETE` for `/todos` and `/notes`, scoped by authenticated `user_id`.
3. Pydantic schemas for request/response bodies.
4. CORS: allow `http://localhost:3000` (frontend dev).

### Phase 3: Frontend — shadcn, Firebase, TanStack Query

**Already done:** Next.js 16 app with Tailwind v4 under `frontend/app/`.

**Remaining:**

1. Initialize shadcn: `npx shadcn@latest init` (see [Styling](#styling-tailwind--shadcnui--custom-css) above).
2. Install: `npm install firebase @tanstack/react-query`.
3. `lib/firebase.ts` — read `NEXT_PUBLIC_FIREBASE_*` from `.env`; export `auth` for sign-in/up/out.
4. Delete or empty `app/credentials.ts` after migration.
5. `context/AuthContext.tsx` — user session, `onAuthStateChanged`, `getIdToken()`.
6. `providers/QueryProvider.tsx` + wrap in `app/layout.tsx`.
7. `lib/api.ts` + `hooks/useTodos.ts` / `hooks/useNotes.ts`.
8. Extend `globals.css`: shadcn dark theme + custom accent/glass tokens.

### Phase 4: UI/UX & API Connection

1. **Auth (shadcn):** `Card`, `Input`, `Button`, `Label` — login/signup on `/`, redirect to `/dashboard` when authenticated.
2. **Dashboard:** `Tabs` for Todos vs Notes; `Card` lists; `Dialog` or inline forms for create/edit; `Skeleton` for loading; toast on mutation errors.
3. Feature components: `TodoList`, `NoteList`, `Navbar` (sign out) — Tailwind for layout, shadcn for controls.
4. Wire lists to `useTodos` / `useNotes`.
5. End-to-end test: sign up → create todo/note → refresh → data persists in Neon.

---

## Environment & security checklist

- [ ] No secrets committed — `.env`, `serviceAccountKey.json` gitignored.
- [ ] Frontend uses only `NEXT_PUBLIC_*` for Firebase client config.
- [ ] Backend `.env` values have no trailing commas (valid dotenv format).
- [ ] Replace placeholder `main.py` / fix `firebase.py` before first API run.

---

## Open questions — resolved

| Question | Decision |
|----------|----------|
| Styling approach | **Tailwind + shadcn/ui** + light **custom CSS** in `globals.css` |
| HTTP client | **Native `fetch`** (no axios) |
| Server state | **TanStack Query** |
| Neon & Firebase setup | **Complete** — proceed with Phase 1 backend structure |
