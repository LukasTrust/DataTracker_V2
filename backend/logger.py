"""
Centralized logging configuration for the application.

This module provides a consistent logging setup across all backend modules.
"""

import logging
import sys
from typing import Optional


def setup_logger(
    name: str,
    level: int = logging.INFO,
    format_string: Optional[str] = None
) -> logging.Logger:
    """
    Setup and configure a logger with consistent formatting.
    
    Args:
        name: Logger name (typically __name__)
        level: Logging level (default: INFO)
        format_string: Custom format string (optional)
        
    Returns:
        Configured logger instance
    """
    if format_string is None:
        format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    
    logger = logging.getLogger(name)
    
    # Avoid adding handlers multiple times
    if not logger.handlers:
        logger.setLevel(level)
        
        # Console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        
        # Formatter
        formatter = logging.Formatter(format_string)
        handler.setFormatter(formatter)
        
        logger.addHandler(handler)
    
    return logger


# Pre-configured loggers for common modules
def get_logger(module_name: str) -> logging.Logger:
    """
    Get a logger for a specific module with standard configuration.
    
    Args:
        module_name: Name of the module
        
    Returns:
        Configured logger
    """
    return setup_logger(f"backend.{module_name}")
