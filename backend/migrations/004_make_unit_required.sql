-- Make unit column required (NOT NULL)
-- First, set a default value for existing NULL units
UPDATE categories SET unit = '€' WHERE unit IS NULL AND type = 'sparen';
UPDATE categories SET unit = 'Einheit' WHERE unit IS NULL AND type = 'normal';
-- Now make the column NOT NULL (SQLite doesn't support ALTER COLUMN)
-- Strategy: create a new table with the desired schema, copy data, drop old table, rename.

BEGIN TRANSACTION;
PRAGMA foreign_keys=off;

CREATE TABLE IF NOT EXISTS categories_new (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	type TEXT NOT NULL DEFAULT 'normal',
	unit TEXT NOT NULL,
	auto_create BOOLEAN NOT NULL DEFAULT 0
);

INSERT INTO categories_new (id, name, type, unit, auto_create)
SELECT id, name, type, COALESCE(unit, 'Einheit'), auto_create FROM categories;

DROP TABLE categories;
ALTER TABLE categories_new RENAME TO categories;

PRAGMA foreign_keys=on;
COMMIT;
