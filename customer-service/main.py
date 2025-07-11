from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import httpx
from prometheus_fastapi_instrumentator import Instrumentator


import crud, schemas, models
from database import SessionLocal, engine

EVENT_BUS_URL = os.getenv("EVENT_BUS_URL", "http://event_bus:4005")

async def publish_event(event: dict):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"{EVENT_BUS_URL}/events", json=event)
    except Exception as e:
        print(f"⚠️ Fehler beim Senden an Event-Bus: {e}")

models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:3000",         
    "http://192.168.178.13:30003",   
]

app = FastAPI(title="Customer Service")
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

@app.post("/customers/", response_model=schemas.Customer)
def create_customer(
    cust_in: schemas.CustomerCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = crud.create_customer(db, cust_in)

    background_tasks.add_task(
        publish_event,
        {
            "type": "CustomerCreated",
            "data": {"customer_id": user.id, "email": user.email}
        }
    )
    return user

@app.get("/customers/{customer_id}", response_model=schemas.Customer)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    user = crud.get_customer_by_id(db, customer_id)
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    return user

@app.post("/customers/login", response_model=schemas.Customer)
def login_customer(
    credentials: schemas.CustomerLogin,
    db: Session = Depends(get_db),
):
    user = crud.authenticate_customer(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user

@app.post("/events")
async def handle_event(
    req: Request,
    db: Session = Depends(get_db)
):
    evt = await req.json()
    return {"status": "ok"}
