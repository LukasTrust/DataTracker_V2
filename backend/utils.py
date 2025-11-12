"""
Utility functions for common operations.

This module provides reusable helper functions for:
- Query parameter parsing
- Date handling and validation
- String sanitization
- Data transformation
"""

import re
from datetime import date, datetime
from typing import List, Optional

from .constants import (
    DATE_FORMAT_MONTH,
    DATE_REGEX_PATTERN,
    EXCEL_INVALID_CHARS,
    EXCEL_MAX_SHEET_TITLE_LENGTH,
)


def parse_comma_separated_ids(value: Optional[str]) -> Optional[List[int]]:
    """
    Parse comma-separated string of integers into a list.
    
    Args:
        value: String like "1,2,3" or None
        
    Returns:
        List of integers or None if input is None
        
    Raises:
        ValueError: If any value cannot be converted to int
        
    Example:
        >>> parse_comma_separated_ids("1,2,3")
        [1, 2, 3]
        >>> parse_comma_separated_ids(None)
        None
    """
    if not value:
        return None
    return [int(x.strip()) for x in value.split(",") if x.strip()]


def validate_date_format(date_str: str) -> bool:
    """
    Validate that a date string matches YYYY-MM format.
    
    Args:
        date_str: Date string to validate
        
    Returns:
        True if valid, False otherwise
        
    Example:
        >>> validate_date_format("2024-01")
        True
        >>> validate_date_format("2024-1")
        False
    """
    return bool(re.match(DATE_REGEX_PATTERN, date_str))


def get_current_month() -> str:
    """
    Get current month in YYYY-MM format.
    
    Returns:
        Current month as string
        
    Example:
        >>> get_current_month()  # If today is 2024-11-15
        '2024-11'
    """
    today = date.today()
    return f"{today.year:04d}-{today.month:02d}"


def format_date_to_month(dt: date) -> str:
    """
    Format a date object to YYYY-MM string.
    
    Args:
        dt: Date object
        
    Returns:
        Formatted date string
        
    Example:
        >>> from datetime import date
        >>> format_date_to_month(date(2024, 11, 15))
        '2024-11'
    """
    return dt.strftime(DATE_FORMAT_MONTH)


def parse_month_string(date_str: str) -> tuple[int, int]:
    """
    Parse YYYY-MM string into year and month integers.
    
    Args:
        date_str: Date string in YYYY-MM format
        
    Returns:
        Tuple of (year, month)
        
    Raises:
        ValueError: If format is invalid
        
    Example:
        >>> parse_month_string("2024-11")
        (2024, 11)
    """
    if not validate_date_format(date_str):
        raise ValueError(f"Invalid date format: {date_str}. Expected YYYY-MM")
    
    year_str, month_str = date_str.split("-")
    return int(year_str), int(month_str)


def sanitize_excel_sheet_title(title: str) -> str:
    """
    Sanitize a string to be a valid Excel sheet title.
    
    Excel sheet titles:
    - Must be max 31 characters
    - Cannot contain: \\ / * [ ] : ?
    
    Args:
        title: Original title
        
    Returns:
        Sanitized title safe for Excel
        
    Example:
        >>> sanitize_excel_sheet_title("My/Invalid*Title:Test?")
        'My_Invalid_Title_Test_'
        >>> sanitize_excel_sheet_title("A" * 50)
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'  # 31 chars
    """
    for char in EXCEL_INVALID_CHARS:
        title = title.replace(char, '_')
    return title[:EXCEL_MAX_SHEET_TITLE_LENGTH]


def safe_float_conversion(value: Optional[float], default: float = 0.0) -> float:
    """
    Safely convert a value to float with a default fallback.
    
    Args:
        value: Value to convert (can be None)
        default: Default value if conversion fails
        
    Returns:
        Float value or default
        
    Example:
        >>> safe_float_conversion(None, 0.0)
        0.0
        >>> safe_float_conversion(42.5)
        42.5
    """
    return float(value) if value is not None else default


def parse_flexible_float(value: str) -> float:
    """
    Parse a string with flexible decimal separator (comma or dot) into a float.
    
    Accepts both German (comma) and English (dot) decimal formats.
    Removes whitespace and handles both separators intelligently.
    
    Args:
        value: String representation of a number (e.g., "1,50" or "1.50")
        
    Returns:
        Float value
        
    Raises:
        ValueError: If the string cannot be parsed as a valid number
        
    Examples:
        >>> parse_flexible_float("1.50")
        1.5
        >>> parse_flexible_float("1,50")
        1.5
        >>> parse_flexible_float("1234.56")
        1234.56
        >>> parse_flexible_float("1234,56")
        1234.56
        >>> parse_flexible_float(" 42,00 ")
        42.0
    """
    if not value or not isinstance(value, str):
        raise ValueError(f"Invalid input: {value}")
    
    # Remove whitespace
    value = value.strip()
    
    if not value:
        raise ValueError("Empty string cannot be converted to float")
    
    # Replace comma with dot for parsing
    normalized = value.replace(',', '.')
    
    try:
        return float(normalized)
    except ValueError:
        raise ValueError(f"Cannot convert '{value}' to a valid number")


def calculate_percentage_change(
    current: float, 
    previous: float, 
    precision: int = 2
) -> Optional[float]:
    """
    Calculate percentage change between two values.
    
    Args:
        current: Current value
        previous: Previous value (base)
        precision: Number of decimal places
        
    Returns:
        Percentage change or None if previous is zero
        
    Example:
        >>> calculate_percentage_change(150, 100)
        50.0
        >>> calculate_percentage_change(75, 100)
        -25.0
        >>> calculate_percentage_change(100, 0)
        None
    """
    if previous == 0:
        return None
    change = ((current - previous) / previous) * 100
    return round(change, precision)
