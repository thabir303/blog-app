from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.v1.router import api_router

import app.models.user  # noqa: F401
import app.models.post  # noqa: F401
import app.models.comment  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Blog Application System API",
    version="1.0.0",
    description="Role-Based Access Control system with Super Admin, Moderator, Regular User, and Guest roles",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Blog Application System API", "docs": "/docs"}
