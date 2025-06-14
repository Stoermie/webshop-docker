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


class ArticleCreateSchema(BaseModel):
    author: Optional[str] = None
    name: str
    price: float
    manufactor: Optional[str] = None
    book_category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    isbn: Optional[str] = None