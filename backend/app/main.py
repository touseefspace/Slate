from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.firebase_init import init_firebase
from app.models import Note, Todo  # noqa: F401 — register models with metadata
from app.routers import notes, todos


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_firebase()
    Base.metadata.create_all(bind=engine)
    yield


settings = get_settings()

app = FastAPI(title="Todo Notes API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(todos.router)
app.include_router(notes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
