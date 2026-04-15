from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

# Create session factory
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

# Base class for all database models
Base = declarative_base()


def get_db():
    """Dependency for getting database session in FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
