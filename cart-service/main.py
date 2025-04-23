from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import SessionLocal, engine, Base
from models import Cart, CartItem
from schemas import (
    CartSchema,
    CartCreateSchema,
    CartItemCreateSchema,
    CartItemSchema,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cart Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/carts/", response_model=CartSchema)
def create_cart(cart_in: CartCreateSchema, db: Session = Depends(get_db)):
    db_cart = Cart()
    db.add(db_cart)
    db.commit()
    db.refresh(db_cart)
    return db_cart

@app.get("/carts/{cart_id}", response_model=CartSchema)
def read_cart(cart_id: int, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

@app.post("/carts/{cart_id}/items", response_model=CartItemSchema)
def add_item(cart_id: int, item_in: CartItemCreateSchema, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    existing = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart_id, CartItem.article_id == item_in.article_id)
        .first()
    )
    if existing:
        existing.quantity += item_in.quantity
        db.commit()
        db.refresh(existing)
        return existing

    new_item = CartItem(
        cart_id=cart_id,
        article_id=item_in.article_id,
        quantity=item_in.quantity
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.delete("/carts/{cart_id}/items/{item_id}", response_model=dict)
def remove_item(cart_id: int, item_id: int, db: Session = Depends(get_db)):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart_id, CartItem.id == item_id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(cart_item)
    db.commit()
    return {"detail": "Item removed"}

@app.put("/carts/{cart_id}/items/{item_id}", response_model=CartItemSchema)
def update_item(cart_id: int, item_id: int, item_in: CartItemCreateSchema, db: Session = Depends(get_db)):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart_id, CartItem.id == item_id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item_in.quantity <= 0:
        db.delete(cart_item)
        db.commit()
        raise HTTPException(status_code=200, detail="Item removed because quantity <= 0")
    cart_item.quantity = item_in.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item
