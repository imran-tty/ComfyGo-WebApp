from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, tourist, guide, manager, public, admin

app = FastAPI(
    title="ComfyGo API",
    description="REST API for the ComfyGo travel and tourism management system",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(tourist.router)
app.include_router(guide.router)
app.include_router(manager.router)
app.include_router(public.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "ComfyGo API"}
