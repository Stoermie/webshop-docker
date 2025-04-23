from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import crud, schemas, models
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from typing import List

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
    try: yield db
    finally: db.close()

@app.post("/orders/", response_model=schemas.Order)
def create_order_endpoint(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    return crud.create_order(db, order)

@app.get("/orders/{customer_id}", response_model=List[schemas.Order])
def read_orders(customer_id: int, db: Session = Depends(get_db)):
    return crud.get_orders_by_customer(db, customer_id)
