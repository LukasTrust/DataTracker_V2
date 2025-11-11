"""
Database migration runner.

This module handles SQL migration files execution in order,
tracking which migrations have been applied to avoid duplicate runs.
"""

import os
import sqlite3
from pathlib import Path
from typing import List

from .constants import MIGRATIONS_TABLE_NAME
from .logger import get_logger


logger = get_logger("migrate")

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def get_db_file() -> str:
    """
    Get database file path from environment or default.
    
    Returns:
        Database file path
    """
    database_url = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'data.db')}"
    )
    # Extract file path from sqlite:/// URL
    if database_url.startswith("sqlite:///"):
        return database_url.replace("sqlite:///", "")
    return database_url


def get_migration_files() -> List[Path]:
    """
    Get sorted list of migration SQL files.
    
    Returns:
        List of Path objects for .sql files in migrations directory
    """
    if not MIGRATIONS_DIR.exists():
        logger.warning(f"Migrations directory not found: {MIGRATIONS_DIR}")
        return []
    
    sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    logger.debug(f"Found {len(sql_files)} migration files")
    return sql_files


def ensure_migrations_table(cursor: sqlite3.Cursor) -> None:
    """
    Create migrations tracking table if it doesn't exist.
    
    Args:
        cursor: SQLite cursor
    """
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {MIGRATIONS_TABLE_NAME} (
            id TEXT PRIMARY KEY,
            applied_at TEXT DEFAULT (datetime('now'))
        )
    """)
    logger.debug(f"Ensured migrations table exists: {MIGRATIONS_TABLE_NAME}")


def is_migration_applied(cursor: sqlite3.Cursor, migration_id: str) -> bool:
    """
    Check if a migration has already been applied.
    
    Args:
        cursor: SQLite cursor
        migration_id: Migration file name
        
    Returns:
        True if migration was already applied, False otherwise
    """
    cursor.execute(
        f"SELECT 1 FROM {MIGRATIONS_TABLE_NAME} WHERE id = ?",
        (migration_id,)
    )
    return cursor.fetchone() is not None


def apply_migration(
    conn: sqlite3.Connection,
    cursor: sqlite3.Cursor,
    migration_file: Path
) -> None:
    """
    Apply a single migration file.
    
    Args:
        conn: SQLite connection
        cursor: SQLite cursor
        migration_file: Path to migration SQL file
        
    Raises:
        Exception: If migration execution fails
    """
    migration_id = migration_file.name
    
    try:
        logger.info(f"Applying migration: {migration_id}")
        
        # Read and execute migration SQL
        sql = migration_file.read_text(encoding="utf-8")
        cursor.executescript(sql)
        
        # Record migration as applied
        cursor.execute(
            f"INSERT INTO {MIGRATIONS_TABLE_NAME} (id) VALUES (?)",
            (migration_id,)
        )
        conn.commit()
        
        logger.info(f"Successfully applied migration: {migration_id}")
    except Exception as e:
        logger.error(f"Failed to apply migration {migration_id}: {e}")
        conn.rollback()
        raise


def run_migrations() -> None:
    """
    Run all pending migrations.
    
    Migrations are applied in alphabetical order (typically numbered like 001_*.sql).
    Already applied migrations are skipped.
    
    Raises:
        Exception: If database operations fail
    """
    logger.info("Starting migration process")
    
    try:
        db_path = get_db_file()
        logger.info(f"Using database: {db_path}")
        
        # Ensure database directory exists
        db_dir = os.path.dirname(db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Ensure tracking table exists
        ensure_migrations_table(cursor)
        conn.commit()
        
        # Get all migration files
        migration_files = get_migration_files()
        
        if not migration_files:
            logger.info("No migration files found")
            conn.close()
            return
        
        # Apply each migration
        applied_count = 0
        skipped_count = 0
        
        for migration_file in migration_files:
            migration_id = migration_file.name
            
            if is_migration_applied(cursor, migration_id):
                logger.debug(f"Skipping already applied migration: {migration_id}")
                skipped_count += 1
                continue
            
            apply_migration(conn, cursor, migration_file)
            applied_count += 1
        
        conn.close()
        
        logger.info(
            f"Migration process completed: {applied_count} applied, "
            f"{skipped_count} skipped"
        )
    except Exception as e:
        logger.error(f"Migration process failed: {e}")
        raise