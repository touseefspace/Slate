# 📓 Slate: Premium Full-Stack Task & Note Platform

Slate is a high-performance, visually stunning, and modern full-stack task and note management platform. It combines a sleek, glassmorphic React 19 frontend with a robust, production-ready FastAPI backend, structured for rapid local iteration and seamless containerized deployments.

---

## 🎨 Architectural Overview

Slate utilizes a modern decoupled architecture, combining cutting-edge frontend client-state paradigms with a secure, highly performant pythonic server.

```mermaid
graph TD
    subgraph Client [Next.js Client - Port 3000]
        UI[Next.js 16 / React 19 UI]
        RQ[React Query State Manager]
        TT[TipTap Rich Text Editor]
        FB_SDK[Firebase Web SDK]
    end

    subgraph Authentication [Authentication Provider]
        FB_Auth[Firebase Authentication]
    end

    subgraph Server [FastAPI Server - Port 8000]
        API[FastAPI Application]
        FB_Admin[Firebase Admin SDK]
        SQLA[SQLAlchemy ORM]
    end

    subgraph Database [Database Cluster]
        Neon[Neon Serverless PostgreSQL]
    end

    %% Auth Flow
    UI -- 1. Login Credentials --> FB_SDK
    FB_SDK -- 2. Authenticate --> FB_Auth
    FB_Auth -- 3. Identity token --> FB_SDK

    %% API Flow
    UI -- 4. Send API requests + Bearer Token --> API
    API -- 5. Verify Token JWT --> FB_Admin
    FB_Admin -- 6. Verify Signature --> FB_Auth
    
    %% Storage Flow
    API -- 7. Query Data --> SQLA
    SQLA -- 8. Read/Write Connection --> Neon
```

---

## 🚀 Key Features

* **Premium Visual Experience**: Fully responsive and unified layout utilizing **Tailwind CSS v4**, custom CSS base components, sleek custom scrollbars, cohesive hover states, and smooth spring animations powered by **Framer Motion**.
* **Rich Text Notes**: Sleek note management using the **TipTap Editor**, giving users the power of block lists, bold/italic text styles, checkboxes, and seamless updates.
* **Intuitive Tasks Layer**: Full CRUD actions on todos, categorizable by states, rendering fluid visual changes when toggled.
* **Instant Authenticated Session Management**: Full integration with **Firebase Auth** (client-side) and token validation via **Firebase Admin SDK** (server-side) to ensure secure endpoint isolation.
* **Server State Optimization**: Cached data operations utilizing **TanStack React Query**, preventing excessive backend payload spam by fine-tuning background synchronization parameters (`refetchOnWindowFocus: false`).
* **Robust Database Integration**: Leverages serverless PostgreSQL hosted on **Neon**, mapped through Python's industry-standard **SQLAlchemy ORM** for query building and migrations.
* **Universal UX Polish**: Comprehensive pointer cursors applied to all clickable UI nodes for superior user interactivity.

---

## 📂 Repository Directory Map

The codebase is organized cleanly into two primary root directories:

```
todo/
├── backend/                  # FastAPI Web Server
│   ├── app/                  # Application Logic Packages
│   │   ├── auth/             # JWT Authentication Middleware & Dependencies
│   │   ├── crud/             # Database Query Functions (CRUD Operations)
│   │   ├── models/           # SQLAlchemy Declarative Database Models
│   │   ├── routers/          # API Route Controllers (Todos, Notes, Dashboard)
│   │   ├── schemas/          # Pydantic Schemas for Request & Response validation
│   │   ├── config.py         # Application configuration & Env loader
│   │   ├── database.py       # SQLAlchemy Session engine setup
│   │   └── firebase_init.py  # Firebase Admin SDK initialization
│   ├── main.py               # Uvicorn server entry point
│   ├── pyproject.toml        # Astral UV dependency specification
│   ├── serviceAccountKey.json # Firebase Admin Credentials (Git Ignored)
│   └── .env                  # Backend sensitive configuration (Git Ignored)
│
├── frontend/                 # Next.js Client Application
│   ├── app/                  # App Router Layouts, Pages & CSS
│   │   ├── dashboard/        # Dashboard view tabs (Todos, Notes)
│   │   ├── login/            # Authentication Views (Login, Registration)
│   │   └── globals.css       # Global styles (Tailwind v4 theme variables)
│   ├── components/           # Modular & Shared React Components
│   │   ├── ui/               # Base visual components (shadcn/ui primitives)
│   │   ├── notes/            # Notes specific UI & Rich Text editors
│   │   └── todos/            # Todos components and Task items
│   ├── context/              # Context Providers (Auth Session context)
│   ├── hooks/                # Custom React Hooks (useTodos, useNotes data queries)
│   ├── lib/                  # Shared utility methods & clients (API, Firebase client)
│   ├── providers/            # Client providers (React Query Context)
│   ├── package.json          # Node dependencies & project scripts
│   └── .env                  # Public Frontend configs (API and Web Firebase API)
│
└── README.md                 # Primary Workspace Documentation
```

---

## ⚙️ Environment Variables Setup

Ensure you configure the `.env` files in both directories prior to running the projects.

### 1. Frontend Configuration (`frontend/.env`)
Create a file named `.env` inside the `frontend/` directory:

```env
# API URL configuration (Local target)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Client Web SDK config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
```

### 2. Backend Configuration (`backend/.env`)
Create a file named `.env` inside the `backend/` directory:

```env
# Database connection (Neon Postgres Connection String)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:3000

# Firebase Service Account Secret Key Configuration
# Can be path-based:
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# OR Inline single-line stringified JSON (Highly recommended for production deployments like Render, Fly.io, etc.):
SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-firebase-app",...}'
```

> [!WARNING]
> Do NOT commit `serviceAccountKey.json` or `.env` files containing actual values to public source control. They are pre-configured in `.gitignore` to prevent leakage.

---

## 🛠️ Step-by-Step Local Launch

Follow these steps to run Slate in a local development environment.

### Prerequisites
* **Node.js** (v18.0 or higher)
* **Python** (v3.12 or higher)
* **Astral `uv`** (Recommended for exceptionally fast Python package management)

---

### Step A: Starting the Backend Server
Navigate into the `backend/` workspace:

1. **Install Dependencies**:
   If utilizing `uv` (recommended):
   ```bash
   uv sync
   ```
   Otherwise, standard pip setup:
   ```bash
   pip install -r requirements.txt
   ```

2. **Launch the Uvicorn Dev Server**:
   Using `uv`:
   ```bash
   uv run python main.py
   ```
   Or directly with Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

Once started, confirm backend activity by requesting the health check:
* **Endpoint**: [http://localhost:8000/health](http://localhost:8000/health) -> should return `{"status":"ok"}`
* **Interactive API docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Step B: Starting the Frontend Web App
Open a separate terminal window and navigate into the `frontend/` directory:

1. **Install Node Packages**:
   ```bash
   npm install
   ```

2. **Run Next.js Dev Server**:
   ```bash
   npm run dev
   ```

Once compilation completes, view your application in the browser:
* **URL**: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Safe Production Secrets Deployment (Firebase Credentials)

When deploying Slate's backend to host environments (e.g., Render, Fly.io, AWS ECS), deploying a physical file like `serviceAccountKey.json` is highly insecure and complex.

To solve this, Slate supports loading credentials directly from the environment using the `SERVICE_ACCOUNT_KEY` environment variable.

### Production Environment Setup
1. Download your Firebase service account JSON file.
2. Flatten the entire JSON file into a single line.
3. In your production hosting platform's Dashboard, set a secret or environment variable named `SERVICE_ACCOUNT_KEY`.
4. Enclose the value in single quotes to properly escape special characters, e.g.:
   ```env
   SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"todo-notes-app-9547d","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",...}'
   ```
The backend startup routine automatically handles both options seamlessly. If `SERVICE_ACCOUNT_KEY` is present, it takes priority and initializes Firebase authentication dynamically.

---

## 🧼 Code Hygiene & Quality Configuration

For active developers working in VS Code, we've enabled linting exclusions to eliminate noise when parsing modern CSS frameworks (like Tailwind CSS v4):
* CSS lint errors relating to `@import "tailwindcss"` or custom Tailwind rules are configured to be ignored within `.vscode/settings.json`, ensuring your editor's terminal outputs remain clean and free of spurious warnings.
