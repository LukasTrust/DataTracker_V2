from sqlmodel import create_engine, SQLModel, Session
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "data.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def init_db():
    # run migrations (simple runner)
    try:
        from .migrate import run_migrations
        run_migrations()
    except Exception:
        # fallback to SQLModel.create_all if migrations fail
        SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)