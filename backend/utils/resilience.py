import asyncio
import random
import logging
from functools import wraps
from typing import Callable, Any
logger = logging.getLogger("ptdt.resilience")
def with_retry_backoff(retries: int = 3, initial_delay: float = 1.0, backoff_factor: float = 2.0):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            for attempt in range(1, retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries:
                        logger.error(f"{func.__name__} failed after {retries} attempts")
                        raise
                    jitter = random.uniform(0.9, 1.1)
                    sleep_time = delay * jitter
                    logger.warning(f"Retry {attempt}/{retries} for {func.__name__} in {sleep_time:.2f}s")
                    await asyncio.sleep(sleep_time)
                    delay *= backoff_factor
            return None
        return wrapper
    return decorator
