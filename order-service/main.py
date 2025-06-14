from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import httpx
import crud, schemas, models
from database import SessionLocal, engine
from typing import List
from prometheus_fastapi_instrumentator import Instrumentator


EVENT_BUS_URL = os.getenv("EVENT_BUS_URL", "http://event_bus:4005")

origins = [
    "http://localhost:3000",          
    "http://192.168.178.122:30003",   
]

async def publish_event(event: dict):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{EVENT_BUS_URL}/events", json=event)
    except Exception as e:
        print(f"⚠️ Fehler beim Senden an Event-Bus: {e}")

models.Base.metadata.create_all(bind=engine)
app = FastAPI()
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/orders/", response_model=schemas.Order)
async def create_order_endpoint(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = crud.create_order(db, order)
    event = {
        "type": "OrderCreated",
        "data": {"order_id": db_order.id, "customer_id": db_order.customer_id}
    }
    import asyncio
    asyncio.create_task(publish_event(event))
    return db_order

@app.get("/orders/{customer_id}", response_model=List[schemas.Order])
def read_orders(customer_id: int, db: Session = Depends(get_db)):
    return crud.get_orders_by_customer(db, customer_id)

@app.post("/events")
async def handle_event(req: Request, db: Session = Depends(get_db)):
    evt = await req.json()
    t = evt.get("type")
    d = evt.get("data", {})
    if t == "CartItemAdded":
        pass
    return {"status": "ok"}