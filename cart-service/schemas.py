from pydantic import BaseModel
from typing import List, Optional

class CartItemBase(BaseModel):
    article_id: int
    quantity: int

    class Config:
        orm_mode = True

class CartItemCreateSchema(CartItemBase):
    pass

class CartItemSchema(CartItemBase):
    id: int

class CartSchema(BaseModel):
    id: int
    items: Optional[List[CartItemSchema]] = []

    class Config:
        orm_mode = True

class CartCreateSchema(BaseModel):
    pass
