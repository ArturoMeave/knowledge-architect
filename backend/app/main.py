from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import ingest

app = FastAPI(title='Knowledge Architect API')


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)

@app.get("/")
async def health_check():
    """Ruta para comprobar que el servidor esta vivo"""
    return {"status": "online", "message": "El cerebro esta funcionando correctamente."}