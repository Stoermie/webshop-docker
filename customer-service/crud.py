from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email==email).first()

def get_customer_by_id(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    hashed_pw = pwd_context.hash(customer.password)
    db_customer = models.Customer(
        email=customer.email,
        hashed_password=hashed_pw,
        name=customer.name,
        address=customer.address
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def authenticate_customer(db: Session, email: str, password: str):
    customer = get_customer_by_email(db, email)
    if not customer or not pwd_context.verify(password, customer.hashed_password):
        return False
    return customer
