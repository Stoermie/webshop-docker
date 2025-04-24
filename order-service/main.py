# order-service/main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import crud, schemas, models
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException, Response
from typing import List
import httpx

# Tabellen erzeugen
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
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

@app.post("/orders/", response_model=schemas.Order)
async def create_order_endpoint(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Bestellung speichern
    db_order = crud.create_order(db, order)

    # ORDER_CREATED-Event bauen
    event = {
        "type": "ORDER_CREATED",
        "data": {
            "order_id": db_order.id,
            "customer_id": db_order.customer_id,
            "items": [
                {"article_id": it.article_id, "quantity": it.quantity}
                for it in order.items
            ]
        }
    }

    # Event an den Bus senden
    async with httpx.AsyncClient() as client:
        try:
            await client.post("http://event-service:4005/events", json=event)
        except Exception as e:
            print(f"⚠️ Fehler beim Senden an Event-Service: {e}")

    return db_order

@app.get("/orders/{customer_id}", response_model=List[schemas.Order])
def read_orders(customer_id: int, db: Session = Depends(get_db)):
    return crud.get_orders_by_customer(db, customer_id)

@app.delete("/orders/{order_id}", status_code=204)
def delete_order_endpoint(order_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_order(db, order_id)  
    if not deleted:
        # falls die Bestellung nicht existiert
        raise HTTPException(status_code=404, detail="Order not found")
    # 204 No Content zurückgeben
    return Response(status_code=204)
