# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Lies den DB‑URL aus der ENV, sonst Fallback
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://piData:senta@postgresdb:5432/catalog_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
