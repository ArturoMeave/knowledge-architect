from fastapi import APIRouter, Depends
from app.database import db
from app.api.deps import get_current_user
from app.models.user import User 

router = APIRouter(
    prefix="/graph", 
    tags=["Grafo"], 
    dependencies=[Depends(get_current_user)]
)

@router.get("/data")
async def get_graph(current_user: User = Depends(get_current_user)):
    return await db.get_graph_data(user_id=current_user.id)