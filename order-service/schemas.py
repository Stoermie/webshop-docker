from pydantic import BaseModel
from typing import List
import datetime

class OrderItemCreate(BaseModel):
    article_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

class OrderItem(BaseModel):
    id: int
    article_id: int
    quantity: int
    class Config:
        orm_mode = True

class Order(BaseModel):
    id: int
    customer_id: int
    order_date: datetime.datetime
    items: List[OrderItem]
    class Config:
        orm_mode = True
