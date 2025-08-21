import os
import logging
from logging.handlers import RotatingFileHandler


def setup_logging(log_file: str) -> logging.Logger:
    logger = logging.getLogger('BusinessOS')
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)

    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    file_handler = RotatingFileHandler(log_file, maxBytes=100 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(threadName)s - %(levelname)s - %(message)s'))
    logger.addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.WARNING)
    console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.addHandler(console_handler)

    return logger