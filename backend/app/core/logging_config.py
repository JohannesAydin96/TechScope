"""
Logging configuration for the TechScope backend.

Configures the application's default logging level and format
for consistent backend log output.

"""

import logging


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format=(
            "%(asctime)s | "
            "%(levelname)s | "
            "%(name)s | "
            "%(message)s"
        ),
    )