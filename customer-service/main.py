from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import httpx
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
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/customers/", response_model=schemas.Customer)
def create_customer(cust: schemas.CustomerCreate, db: Session = Depends(get_db)):
    if crud.get_customer_by_email(db, cust.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_customer(db, cust)
    import asyncio
    asyncio.create_task(publish_event({
        "type": "CustomerCreated",
        "data": {"customer_id": user.id, "email": user.email}
    }))
    return user

@app.post("/customers/login", response_model=schemas.Customer)
def login_customer(credentials: schemas.CustomerLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_customer(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user

@app.post("/events")
async def handle_event(req: Request, db: Session = Depends(get_db)):
    evt = await req.json()
    # handle incoming events if needed
    return {"status": "ok"}