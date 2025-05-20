from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import httpx
from typing import List
from prometheus_fastapi_instrumentator import Instrumentator


from database import SessionLocal, engine, Base
from models import Article
from schemas import ArticleSchema, ArticleCreateSchema

EVENT_BUS_URL = os.getenv("EVENT_BUS_URL", "http://event_bus:4005")

async def publish_event(event: dict):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{EVENT_BUS_URL}/events", json=event)
    except Exception as e:
        print(f"⚠️ Fehler beim Senden an Event-Bus: {e}")

origins = [
    "http://localhost:3000",          # falls du lokal entwickelst
    "http://192.168.178.122:30003",   # deine NodePort-Adresse für das Frontend
]

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Catalog Service")
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health-Check
@app.get("/health")
async def health():
    return {"status": "ok"}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/articles/", response_model=ArticleSchema)
def create_article(a: ArticleCreateSchema, db: Session = Depends(get_db)):
    art = Article(**a.dict())
    db.add(art)
    db.commit()
    db.refresh(art)
    # Publish product created event
    import asyncio
    asyncio.create_task(publish_event({
        "type": "ProductCreated",
        "data": {"article_id": art.article_id, "name": art.name, "price": art.price}
    }))
    return art

@app.get("/api/articles/", response_model=List[ArticleSchema])
def list_articles(db: Session = Depends(get_db)):
    return db.query(Article).all()

@app.get("/api/articles/{article_id}", response_model=ArticleSchema)
def get_article(article_id: int, db: Session = Depends(get_db)):
    art = db.query(Article).filter(Article.article_id == article_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found")
    return art

@app.post("/events")
async def handle_event(req: Request):
    evt = await req.json()
    # e.g. adjust stock on OrderCreated
    return {"status": "ok"}