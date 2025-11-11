from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from typing import Optional
import logging

logger = logging.getLogger("backend.scheduler")
_scheduler: Optional[BackgroundScheduler] = None

def _run_auto_create():
    try:
        from .crud import auto_create_entries_for_month
        created = auto_create_entries_for_month()
        logger.info("auto_create_entries_for_month created %d entries", len(created))
    except Exception as e:
        logger.exception("auto-create job failed: %s", e)

def start_scheduler():
    global _scheduler
    if _scheduler is not None:
        return
    _scheduler = BackgroundScheduler()
    # run immediately once (ensure current month)
    _run_auto_create()
    # then schedule monthly on day 1 at 00:05
    trigger = CronTrigger(day="1", hour="0", minute="5")
    _scheduler.add_job(_run_auto_create, trigger, id="monthly_auto_create", replace_existing=True)
    _scheduler.start()
    logger.info("Scheduler started, monthly job scheduled.")

def stop_scheduler():
    global _scheduler
    if _scheduler is None:
        return
    _scheduler.shutdown(wait=False)
    _scheduler = None
    logger.info("Scheduler stopped.")