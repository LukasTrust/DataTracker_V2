-- Migration: Add units to existing "sparen" categories
-- Set unit to "€" for all financial categories

UPDATE categories 
SET unit = '€' 
WHERE type = 'sparen' AND (unit IS NULL OR unit = '');
