from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, index=True, nullable=False)
    order_date = Column(DateTime, default=datetime.datetime.utcnow)
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    article_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    order = relationship("Order", back_populates="items")
