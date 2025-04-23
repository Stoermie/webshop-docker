from pydantic import BaseModel, EmailStr
from typing import Optional

class CustomerBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    password: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class Customer(CustomerBase):
    id: int
    class Config:
        orm_mode = True