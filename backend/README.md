# ⚙️ Slate Backend (FastAPI Server)

Welcome to the Slate Backend documentation. The server is structured as a professional, highly scalable **FastAPI** application designed to handle task management and rich-text note operations.

---

## 🛠️ Stack & Technologies

* **Language**: Python 3.12+ / 3.14+
* **Framework**: **FastAPI** for ultra-fast, auto-documenting, asynchronous REST endpoints.
* **Database & ORM**: **SQLAlchemy 2.0** for object-relational mapping, combined with serverless Postgres hosted on **Neon**.
* **Dependencies & Toolchain**: **Astral `uv`** for near-instant package installation, lockfile stability, and isolated run environments.
* **Validation Layer**: **Pydantic v2 & Pydantic Settings** for fast configuration loading and request body schema enforcement.
* **Authentication**: **Firebase Admin SDK** for server-side verification of user JWT tokens.

---

## 📂 Backend Directory Mapping

```
backend/
├── app/                      # Main Application Package
│   ├── auth/                 # Authorization Modules
│   │   ├── dependencies.py   # Token extraction & Firebase signature validation
│   │   └── models.py         # In-memory session schemas (e.g., CurrentUser)
│   │
│   ├── crud/                 # Database Query Logic (CRUD)
│   │   ├── notes.py          # Create, read, update, and delete Note models
│   │   └── todos.py          # Create, read, update, and delete Todo models
│   │
│   ├── models/               # SQLAlchemy Declarative Tables
│   │   ├── base.py           # Shared Declarative Base model
│   │   ├── note.py           # Note model (user_id relationship, content, timestamps)
│   │   └── todo.py           # Todo model (user_id, completed status, tags)
│   │
│   ├── routers/              # API Endpoint Controllers
│   │   ├── dashboard.py      # Multi-resource analytical feeds
│   │   ├── notes.py          # Notes CRUD routes (/notes)
│   │   └── todos.py          # Todos CRUD routes (/todos)
│   │
│   ├── schemas/              # Pydantic Input/Output Schemas
│   │   ├── note.py           # Input and response validation for notes
│   │   └── todo.py           # Input and response validation for todos
│   │
│   ├── config.py             # System Settings (Pydantic BaseSettings loader)
│   ├── database.py           # Connection engine & session factories
│   └── firebase_init.py      # Core Firebase Admin initialization setup
│
├── main.py                   # High-level entry point (Uvicorn trigger)
├── pyproject.toml            # UV metadata and python dependency package details
├── serviceAccountKey.json    # Private credential file (Git Ignored)
└── .env                      # Local sensitive variables (Git Ignored)
```

---

## ⚙️ Environment Configuration

Setup a `.env` file in the root of the `backend/` directory:

```env
# Database Credentials (Neon PostgreSQL pooled connection)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# CORS Settings
CORS_ORIGINS=http://localhost:3000

# Path-based Firebase Secret (Local)
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# OR Inline single-line stringified JSON (Highly recommended for production deployments like Render, Fly.io, etc.):
# SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-firebase-app",...}'
```

---

## 🚀 Running the FastAPI Server

### 1. Fast Launch with Astral `uv`
If you have `uv` installed, this manages python runtimes and dependencies in milliseconds.

```bash
# Sync dependency packages
uv sync

# Run the app
uv run python main.py
```

### 2. Standard Launch with Pip & Virtualenv
If you prefer standard python:

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start with Uvicorn
uvicorn app.main:app --reload --port 8000
```

---

## 🔍 REST Endpoints & Documentation

Once the backend is active on **`http://localhost:8000`**, you can explore and interact with the API:

* **Health Status**: [http://localhost:8000/health](http://localhost:8000/health)
* **Auto-generated Swagger UI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Alternative ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔐 Advanced Security & Firebase Injection

### Production Credential Safe-Harbor
To comply with security audits, the server **never** requires sensitive credentials to be stored as files in production. 

The application startup procedure in `app/firebase_init.py` implements a hybrid load logic:
1. First, it checks if `SERVICE_ACCOUNT_KEY` exists as a non-empty environment variable. If found, it parses it from a stringified JSON format and initializes Firebase.
2. If `SERVICE_ACCOUNT_KEY` is not set, it checks if `GOOGLE_APPLICATION_CREDENTIALS` matches an existing physical file path.
3. This setup ensures seamless local execution using the traditional `.json` file while enabling standard 12-factor cloud secrets configuration in production.
