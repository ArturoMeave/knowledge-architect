from fastapi import APIRouter
from app.database import db

router = APIRouter(prefix= "/graph", tags=["Grafo"])

@router.get("/data")
async def get_graph():
    """Devuelve todo el mapa mental guardado en Neo4j"""
    return await db.get_graph_data()