from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import httpx

from database import SessionLocal, engine, Base
from models import Cart, CartItem
from schemas import CartSchema, CartCreateSchema, CartItemCreateSchema, CartItemSchema

# Event-Bus URL
EVENT_BUS_URL = os.getenv("EVENT_BUS_URL", "http://event_bus:4005")

async def publish_event(event: dict):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{EVENT_BUS_URL}/events", json=event)
    except Exception as e:
        print(f"⚠️ Fehler beim Senden an Event-Bus: {e}")

# DB setup
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Cart Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/carts/", response_model=CartSchema)
def create_cart(
    cart_in: CartCreateSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    db_cart = Cart(**cart_in.dict())
    db.add(db_cart)
    db.commit()
    db.refresh(db_cart)

    # Publish event in background
    background_tasks.add_task(
        publish_event,
        {
            "type": "CartCreated",
            "data": {"cart_id": db_cart.id}
        }
    )
    return db_cart

@app.get("/carts/{cart_id}", response_model=CartSchema)
def read_cart(
    cart_id: int,
    db: Session = Depends(get_db)
):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

@app.post("/carts/{cart_id}/items", response_model=CartItemSchema)
def add_item(
    cart_id: int,
    item_in: CartItemCreateSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Check if item exists in cart
    existing = db.query(CartItem).filter(
        CartItem.cart_id == cart_id,
        CartItem.article_id == item_in.article_id
    ).first()
    if existing:
        existing.quantity += item_in.quantity
        db.commit()
        db.refresh(existing)
        new_item = existing
    else:
        new_item = CartItem(
            cart_id=cart_id,
            article_id=item_in.article_id,
            quantity=item_in.quantity
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)

    # Publish item added event in background
    background_tasks.add_task(
        publish_event,
        {
            "type": "CartItemAdded",
            "data": {
                "cart_id": cart_id,
                "article_id": new_item.article_id,
                "quantity": new_item.quantity
            }
        }
    )
    return new_item

@app.delete("/carts/{cart_id}/items/{item_id}", response_model=dict)
def remove_item(
    cart_id: int,
    item_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    ci = db.query(CartItem).filter(
        CartItem.cart_id == cart_id,
        CartItem.id == item_id
    ).first()
    if not ci:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(ci)
    db.commit()

    # Publish item removed event in background
    background_tasks.add_task(
        publish_event,
        {
            "type": "CartItemRemoved",
            "data": {"cart_id": cart_id, "item_id": item_id}
        }
    )
    return {"detail": "Item removed"}

@app.post("/events")
async def handle_event(
    req: Request,
    db: Session = Depends(get_db)
):
    evt = await req.json()
    t = evt.get("type")
    d = evt.get("data", {})
    if t == "OrderCreated":
        # clear cart when order placed
        db.query(CartItem).filter(CartItem.cart_id == d.get("cart_id")).delete()
        db.commit()
    return {"status": "ok"}
