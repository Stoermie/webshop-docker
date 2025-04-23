from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import crud, schemas, models
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware

# Tabellen in der DB anlegen
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS, damit dein React-Frontend zugreifen kann
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],            # spätere Frontend-URL hier eintragen
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# DB-Session-Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Registrierung
@app.post("/customers/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    if crud.get_customer_by_email(db, customer.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_customer(db, customer)

# Login
@app.post("/customers/login", response_model=schemas.Customer)
def login_customer(credentials: schemas.CustomerLogin, db: Session = Depends(get_db)):
    customer = crud.authenticate_customer(db, credentials.email, credentials.password)
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return customer

# Profil abrufen
@app.get("/customers/{customer_id}", response_model=schemas.Customer)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    db_c = crud.get_customer_by_id(db, customer_id)
    if not db_c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_c

@app.patch("/customers/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, data: schemas.CustomerBase, db: Session = Depends(get_db)):
    db_c = crud.get_customer(db, customer_id)
    if not db_c:
        raise HTTPException(404, "Not found")
    for field, val in data.dict(exclude_unset=True).items():
        setattr(db_c, field, val)
    db.commit()
    db.refresh(db_c)
    return db_c

