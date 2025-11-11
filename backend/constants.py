"""
Application constants and enums.

This module centralizes all magic strings, configuration values, and enums
to ensure consistency across the application.
"""

from enum import Enum
from pathlib import Path


class CategoryType(str, Enum):
    """Category types."""
    NORMAL = "normal"
    SPAREN = "sparen"  # Savings/Financial category


class Currency(str, Enum):
    """Supported currencies."""
    EURO = "€"
    DOLLAR = "$"
    POUND = "£"


# Database Configuration
DB_FILE_NAME = "data.db"
MIGRATIONS_TABLE_NAME = "applied_migrations"

# Date Format
DATE_FORMAT_MONTH = "%Y-%m"  # YYYY-MM
DATE_REGEX_PATTERN = r"^\d{4}-\d{2}$"

# Category Defaults
DEFAULT_CATEGORY_TYPE = CategoryType.NORMAL
DEFAULT_AUTO_CREATE = False
SPAREN_DEFAULT_UNIT = Currency.EURO.value

# Duplicate suffix
DUPLICATE_SUFFIX = " (Kopie)"

# Excel Export Configuration
EXCEL_MAX_SHEET_TITLE_LENGTH = 31
EXCEL_INVALID_CHARS = ['\\', '/', '*', '[', ']', ':', '?']
EXCEL_DEFAULT_FILENAME = "datatracker_export.xlsx"

# Scheduler Configuration
SCHEDULER_JOB_ID = "monthly_auto_create"
SCHEDULER_CRON_DAY = "1"
SCHEDULER_CRON_HOUR = "0"
SCHEDULER_CRON_MINUTE = "5"

# API Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000"
]
