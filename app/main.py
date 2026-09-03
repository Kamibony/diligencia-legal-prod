from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.incidents import router as incidents_router

app = FastAPI(title="Legal Backend API")

app.include_router(health_router)
app.include_router(incidents_router)
