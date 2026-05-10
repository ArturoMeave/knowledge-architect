from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database_users import get_db
from app.models.user import User
from app.core.security import get_password_hash
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

@router.post("/register")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.email == user_in.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    hashed_pass = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pass
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"status": "success", "message": "Usuario creado", "id": new_user.id}