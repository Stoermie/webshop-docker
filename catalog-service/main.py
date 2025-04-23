from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, engine, Base
from models import Article
from schemas import ArticleSchema

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Catalog Service")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/articles/", response_model=List[ArticleSchema])
def list_articles(db: Session = Depends(get_db)):
    return db.query(Article).all()

@app.get("/api/articles/{article_id}", response_model=ArticleSchema)
def get_article(article_id: int, db: Session = Depends(get_db)):
    art = db.query(Article).filter(Article.article_id == article_id).first()
    if not art:
        raise HTTPException(404, "Article not found")
    return art
