from fastapi import APIRouter, Depends
from app.database import db
from app.api.deps import get_current_user # Importamos al guardián que creamos

# Aplicamos la protección a nivel de Router: 
# Ahora nadie puede entrar a ninguna ruta de /graph sin un token válido.
router = APIRouter(
    prefix="/graph", 
    tags=["Grafo"], 
    dependencies=[Depends(get_current_user)]
)

@router.get("/data")
async def get_graph():
    """Devuelve todo el mapa mental guardado en Neo4j"""
    return await db.get_graph_data()