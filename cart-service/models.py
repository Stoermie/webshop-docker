# cart_service/models.py
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    # Weitere Felder wie creation_date könnten hier ergänzt werden

    # Beziehung zu den CartItems:
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"))
    article_id = Column(Integer, index=True)  # Optional auch als ForeignKey zu articles.article_id
    quantity = Column(Integer, default=1)

    cart = relationship("Cart", back_populates="items")
