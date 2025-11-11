"""
Background scheduler for automated tasks.

This module manages the APScheduler instance for periodic tasks
like auto-creating monthly entries for categories.
"""

from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .logger import get_logger
from .constants import (
    SCHEDULER_JOB_ID,
    SCHEDULER_CRON_DAY,
    SCHEDULER_CRON_HOUR,
    SCHEDULER_CRON_MINUTE,
)


logger = get_logger("scheduler")

# Global scheduler instance
_scheduler: Optional[BackgroundScheduler] = None


def _run_auto_create() -> None:
    """
    Execute auto-creation job for current month.
    
    This function is called by the scheduler on its cron schedule.
    """
    try:
        from .crud import auto_create_entries_for_month
        
        created = auto_create_entries_for_month()
        logger.info(
            f"Auto-create job completed successfully: {len(created)} entries created"
        )
    except Exception as e:
        logger.exception(f"Auto-create job failed: {e}")


def start_scheduler() -> None:
    """
    Start the background scheduler.
    
    Runs auto-creation immediately once, then schedules it to run
    monthly on the 1st at 00:05.
    
    If scheduler is already running, this function does nothing.
    """
    global _scheduler
    
    if _scheduler is not None:
        logger.warning("Scheduler already running, skipping start")
        return
    
    try:
        _scheduler = BackgroundScheduler()
        
        # Run immediately once to ensure current month is covered
        logger.info("Running initial auto-create check")
        _run_auto_create()
        
        # Schedule monthly job on day 1 at 00:05
        trigger = CronTrigger(
            day=SCHEDULER_CRON_DAY,
            hour=SCHEDULER_CRON_HOUR,
            minute=SCHEDULER_CRON_MINUTE
        )
        
        _scheduler.add_job(
            _run_auto_create,
            trigger,
            id=SCHEDULER_JOB_ID,
            replace_existing=True
        )
        
        _scheduler.start()
        logger.info(
            f"Scheduler started successfully. Monthly job scheduled for "
            f"day {SCHEDULER_CRON_DAY} at {SCHEDULER_CRON_HOUR}:{SCHEDULER_CRON_MINUTE}"
        )
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        _scheduler = None
        raise


def stop_scheduler() -> None:
    """
    Stop the background scheduler.
    
    Shuts down the scheduler gracefully without waiting for running jobs.
    If scheduler is not running, this function does nothing.
    """
    global _scheduler
    
    if _scheduler is None:
        logger.warning("Scheduler not running, skipping stop")
        return
    
    try:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")
        # Reset scheduler reference even on error
        _scheduler = None
        raise