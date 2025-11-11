-- initial schema for DataTracker_V2

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'normal',
    unit TEXT,
    auto_create BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM
    value REAL NOT NULL DEFAULT 0.0,
    deposit REAL,
    comment TEXT,
    auto_generated BOOLEAN NOT NULL DEFAULT 0
);