from sqlalchemy import Column, Integer, String, Float, Text
from database import Base

class Article(Base):
    __tablename__ = "articles"

    article_id    = Column(Integer, primary_key=True, index=True)
    author        = Column(String(255), nullable=True)
    name          = Column(String(255), nullable=False)
    price         = Column(Float, nullable=False)
    manufactor    = Column(String(255), nullable=True)
    book_category = Column(String(100), nullable=True)
    description   = Column(Text, nullable=True)
    image_url     = Column(String(500), nullable=True)
    isbn          = Column(String(20), nullable=True)
