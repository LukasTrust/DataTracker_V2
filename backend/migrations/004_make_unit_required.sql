-- Make unit column required (NOT NULL)
-- First, set a default value for existing NULL units
UPDATE categories SET unit = '€' WHERE unit IS NULL AND type = 'sparen';
UPDATE categories SET unit = 'Einheit' WHERE unit IS NULL AND type = 'normal';

-- Now make the column NOT NULL
ALTER TABLE categories ALTER COLUMN unit SET NOT NULL;
