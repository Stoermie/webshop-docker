# catalog_service/schemas.py
from pydantic import BaseModel
from typing import Optional

class ArticleSchema(BaseModel):
    article_id: int
    author: Optional[str]
    name: str
    price: float
    manufactor: Optional[str]
    book_category: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    isbn: Optional[str]

    class Config:
        orm_mode = True