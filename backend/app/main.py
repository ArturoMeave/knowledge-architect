import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import db
from app.database_users import Base, engine
from contextlib import asynccontextmanager
from app.api.routes import ingest, graph, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()   
    await db.init_db()   
    Base.metadata.create_all(bind=engine)
    yield
    await db.close()    

app = FastAPI(title='Knowledge Architect API', lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*",]
)

app.include_router(ingest.router)
app.include_router(graph.router)
app.include_router(auth.router)