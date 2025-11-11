import sqlite3
from pathlib import Path
from .db import DB_FILE

MIGRATIONS_DIR = Path(__file__).parent / "migrations"
MIGRATIONS_TABLE = "applied_migrations"

def run_migrations():
    db_path = DB_FILE
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    # ensure migrations table
    cur.execute(f"""
    CREATE TABLE IF NOT EXISTS {MIGRATIONS_TABLE} (
        id TEXT PRIMARY KEY,
        applied_at TEXT DEFAULT (datetime('now'))
    )
    """)
    conn.commit()

    sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    for f in sql_files:
        migration_id = f.name
        cur.execute(f"SELECT 1 FROM {MIGRATIONS_TABLE} WHERE id = ?", (migration_id,))
        if cur.fetchone():
            continue
        sql = f.read_text(encoding="utf-8")
        cur.executescript(sql)
        cur.execute(f"INSERT INTO {MIGRATIONS_TABLE} (id) VALUES (?)", (migration_id,))
        conn.commit()
    conn.close()