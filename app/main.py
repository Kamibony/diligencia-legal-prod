from fastapi import FastAPI

app = FastAPI(title="Legal Backend API")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "legal-backend"}
