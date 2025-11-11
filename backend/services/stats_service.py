"""
Statistics and dashboard service.

This module handles all statistical calculations and dashboard data aggregation,
separating complex business logic from the API layer.
"""

from typing import Dict, List, Optional, Any
from ..crud import (
    list_categories,
    list_entries_for_category,
    aggregate_entries,
    monthly_by_year,
)
from ..models import Category, Entry
from ..constants import CategoryType
from ..logger import get_logger
from ..utils import calculate_percentage_change, safe_float_conversion


logger = get_logger("services.stats")


def calculate_sparkline_data(entries: List[Entry], limit: int = 10) -> List[Dict[str, Any]]:
    """
    Calculate sparkline data from entries.
    
    Args:
        entries: List of Entry objects
        limit: Maximum number of data points
        
    Returns:
        List of sparkline data points with date and value
    """
    sorted_entries = sorted(entries, key=lambda x: x.date)
    last_entries = sorted_entries[-limit:] if len(sorted_entries) > limit else sorted_entries
    
    return [
        {
            "date": e.date.isoformat() if hasattr(e.date, 'isoformat') else str(e.date),
            "value": safe_float_conversion(e.value)
        }
        for e in last_entries
    ]


def calculate_category_total(category: Category, entries: List[Entry]) -> float:
    """
    Calculate total value for a category based on its type.
    
    For "sparen" (savings) categories: use only the last value
    For other categories: sum all values
    
    Args:
        category: Category object
        entries: List of Entry objects for this category
        
    Returns:
        Total value
    """
    if not entries:
        return 0.0
    
    if category.type == CategoryType.SPAREN.value:
        sorted_entries = sorted(entries, key=lambda x: x.date)
        return safe_float_conversion(sorted_entries[-1].value)
    
    return sum(safe_float_conversion(e.value) for e in entries)


def calculate_profit_metrics(
    total_value: float,
    total_deposits: float
) -> Dict[str, Optional[float]]:
    """
    Calculate profit and profit percentage for savings categories.
    
    Args:
        total_value: Current total value
        total_deposits: Total deposits made
        
    Returns:
        Dictionary with 'profit' and 'profitPercentage' keys
    """
    if total_deposits == 0:
        return {"profit": None, "profitPercentage": None}
    
    profit = total_value - total_deposits
    profit_percentage = calculate_percentage_change(total_value, total_deposits)
    
    return {
        "profit": profit,
        "profitPercentage": profit_percentage
    }


def get_dashboard_stats() -> Dict[str, Any]:
    """
    Generate comprehensive dashboard statistics.
    
    Returns:
        Dictionary containing:
        - totalCategories: Number of categories
        - categorySums: List of per-category statistics
    """
    logger.info("Generating dashboard statistics")
    
    categories = list_categories()
    category_stats = []
    
    for cat in categories:
        entries = list_entries_for_category(cat.id)
        
        # Calculate totals
        total_value = calculate_category_total(cat, entries)
        total_deposits = sum(
            safe_float_conversion(e.deposit) 
            for e in entries 
            if e.deposit is not None
        )
        
        # Calculate sparkline
        sparkline_data = calculate_sparkline_data(entries)
        
        # Calculate profit metrics for savings categories
        profit_metrics = calculate_profit_metrics(total_value, total_deposits)
        
        category_stats.append({
            "id": cat.id,
            "name": cat.name,
            "type": cat.type,
            "unit": cat.unit,
            "totalValue": total_value,
            "totalDeposits": total_deposits,
            "entryCount": len(entries),
            "sparklineData": sparkline_data,
            **profit_metrics
        })
    
    logger.info(f"Generated statistics for {len(categories)} categories")
    
    return {
        "totalCategories": len(categories),
        "categorySums": category_stats
    }


def get_dashboard_timeseries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate timeseries data for dashboard charts.
    
    Args:
        start_date: Start date filter (YYYY-MM-DD)
        end_date: End date filter (YYYY-MM-DD)
        category_type: Filter by category type ("sparen", "normal", or "all")
        
    Returns:
        Dictionary containing timeseries and comparison data
    """
    logger.info(
        f"Generating timeseries data: start={start_date}, end={end_date}, type={category_type}"
    )
    
    categories = list_categories()
    
    # Filter by type
    if category_type and category_type != "all":
        categories = [c for c in categories if c.type == category_type]
    
    # Collect entries per category
    category_entries_map = {}
    all_dates = set()
    
    for cat in categories:
        entries = list_entries_for_category(cat.id)
        
        # Apply date filters
        if start_date:
            entries = [e for e in entries if str(e.date) >= start_date]
        if end_date:
            entries = [e for e in entries if str(e.date) <= end_date]
        
        category_entries_map[cat.id] = {
            'category': cat,
            'entries': sorted(entries, key=lambda x: x.date)
        }
        
        for entry in entries:
            date_str = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
            all_dates.add(date_str)
    
    # Build timeseries data
    all_data = {}
    sparen_data = {}
    
    for date_str in sorted(all_dates):
        total_value = 0.0
        sparen_value = 0.0
        sparen_deposits = 0.0
        
        for cat_id, data in category_entries_map.items():
            cat = data['category']
            entries = data['entries']
            
            # Only include € categories in total
            if cat.unit != "€":
                continue
            
            if cat.type == CategoryType.SPAREN.value:
                # For sparen: use the last value up to this date
                last_entry = None
                for entry in entries:
                    entry_date = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
                    if entry_date <= date_str:
                        last_entry = entry
                
                if last_entry:
                    value = safe_float_conversion(last_entry.value)
                    total_value += value
                    sparen_value += value
                
                # Sum deposits up to this date
                for entry in entries:
                    entry_date = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
                    if entry_date <= date_str and entry.deposit:
                        sparen_deposits += safe_float_conversion(entry.deposit)
            else:
                # For normal: sum all values up to this date
                for entry in entries:
                    entry_date = entry.date.isoformat() if hasattr(entry.date, 'isoformat') else str(entry.date)
                    if entry_date <= date_str:
                        total_value += safe_float_conversion(entry.value)
        
        all_data[date_str] = {"date": date_str, "value": total_value}
        
        if sparen_value > 0 or sparen_deposits > 0:
            sparen_data[date_str] = {
                "date": date_str,
                "value": sparen_value,
                "deposits": sparen_deposits,
                "profit": sparen_value - sparen_deposits
            }
    
    # Category comparison
    category_comparison = []
    for cat_id, data in category_entries_map.items():
        cat = data['category']
        entries = data['entries']
        
        total_value = calculate_category_total(cat, entries)
        
        category_comparison.append({
            "name": cat.name,
            "value": total_value,
            "type": cat.type
        })
    
    logger.info(
        f"Generated timeseries with {len(all_data)} data points and {len(category_comparison)} categories"
    )
    
    return {
        "totalValueData": sorted(all_data.values(), key=lambda x: x["date"]),
        "sparenData": sorted(sparen_data.values(), key=lambda x: x["date"]),
        "categoryComparison": category_comparison
    }


def get_stats_overview(
    category_ids: Optional[List[int]] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get overview statistics for entries.
    
    Args:
        category_ids: Filter by category IDs
        from_date: Start date (YYYY-MM)
        to_date: End date (YYYY-MM)
        
    Returns:
        Aggregated statistics
    """
    logger.info(
        f"Generating overview stats: categories={category_ids}, from={from_date}, to={to_date}"
    )
    
    stats = aggregate_entries(
        category_ids=category_ids,
        from_date=from_date,
        to_date=to_date
    )
    
    logger.info(f"Overview stats: {stats['count']} entries, sum={stats['sum']}")
    
    return stats


def get_monthly_stats(
    category_id: int,
    from_year: Optional[int] = None,
    to_year: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Get monthly statistics by year for a category.
    
    Args:
        category_id: Category ID
        from_year: Start year (inclusive)
        to_year: End year (inclusive)
        
    Returns:
        Monthly aggregated data by year
    """
    logger.info(
        f"Generating monthly stats: category={category_id}, from={from_year}, to={to_year}"
    )
    
    data = monthly_by_year(
        category_id=category_id,
        from_year=from_year,
        to_year=to_year
    )
    
    years_count = len(data.get('years', {}))
    logger.info(f"Monthly stats generated for {years_count} years")
    
    return data
