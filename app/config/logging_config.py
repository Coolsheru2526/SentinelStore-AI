import logging
import sys
from datetime import datetime

def setup_logging(log_level=logging.INFO):
    """Configure logging for the entire application."""
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(name)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # File handler (optional - uncomment to enable file logging)
    # file_handler = logging.FileHandler(f'logs/app_{datetime.now().strftime("%Y%m%d")}.log')
    # file_handler.setFormatter(formatter)
    # file_handler.setLevel(logging.DEBUG)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    # root_logger.addHandler(file_handler)
    
    # Set levels for specific loggers
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    
    return root_logger

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a module."""
    return logging.getLogger(name)

