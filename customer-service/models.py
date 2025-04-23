from sqlalchemy import Column, Integer, String
from database import Base

class Customer(Base):
    __tablename__ = "customers"
    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String,  unique=True, index=True, nullable=False)
    hashed_password = Column(String,  nullable=False)
    name            = Column(String,  nullable=True)    # neu
    address         = Column(String,  nullable=True) 
