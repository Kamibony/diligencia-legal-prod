from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.incidents import router as incidents_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Legal Backend API")

# Configure CORS
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.web\.app|https://.*\.firebaseapp\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(incidents_router)
