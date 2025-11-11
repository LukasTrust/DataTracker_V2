"""
Database configuration and connection management.

This module handles database engine creation, initialization,
and session management for SQLModel.
"""

import os
from pathlib import Path
from sqlmodel import create_engine, SQLModel, Session

from .logger import get_logger


logger = get_logger("db")

# Database file path
DB_FILE = os.path.join(os.path.dirname(__file__), "..", "data.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

# Create engine with connection pooling configuration
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False  # Set to True for SQL query logging during development
)


def init_db() -> None:
    """
    Initialize the database.
    
    Attempts to run migrations first. Falls back to SQLModel.create_all
    if migrations fail (e.g., during first setup).
    
    Raises:
        Exception: If both migration and fallback initialization fail
    """
    logger.info("Initializing database")
    
    try:
        from .migrate import run_migrations
        run_migrations()
        logger.info("Database initialized via migrations")
    except Exception as migration_error:
        logger.warning(
            f"Migration failed: {migration_error}. Falling back to create_all"
        )
        try:
            SQLModel.metadata.create_all(engine)
            logger.info("Database initialized via SQLModel.create_all")
        except Exception as fallback_error:
            logger.error(f"Database initialization failed: {fallback_error}")
            raise


def get_session() -> Session:
    """
    Create and return a new database session.
    
    Use as a context manager to ensure proper session cleanup:
        with get_session() as session:
            # database operations
    
    Returns:
        SQLModel Session instance
    """
    return Session(engine)