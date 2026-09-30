"""
File storage utilities for TechScope.

Provides safe cleanup of stored files while preventing file-system
errors from interrupting higher-level application operations.

"""

import logging
from pathlib import Path


logger = logging.getLogger(__name__)


def delete_file_if_exists(file_path: str | Path) -> None:

    """
    Delete a file if it exists.

    A missing file is treated as already deleted. Other file-system
    errors are logged without interrupting the calling operation.

    """

    path = Path(file_path)

    try:
        path.unlink(missing_ok=True)
    except OSError:
        logger.exception(
            "Failed to delete stored file: path=%s",
            path,
        )