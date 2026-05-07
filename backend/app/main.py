from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import ingest, graph
from app.database import db
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("Cerrando conexion con Neo4j...")
    db.close()

app = FastAPI(
    title='Knowledge Architect API',
    lifespan=lifespan
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(graph.router)

@app.get("/")
async def health_check():
    return {"status": "online", "message": "El cerebro esta funcionando correctamente."}