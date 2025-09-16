"""
Thumbnail generation utilities for Cola‑Link‑e‑Pronto.

This module provides functionality to generate multiple A/B
thumbnails for a given video. The real implementation would extract
frames from the video, apply overlays and text. Here we return dummy
file paths.
"""

from typing import Dict


def generate_thumbnails(video_path: str, job_id: str) -> Dict[str, str]:
    """Generate thumbnail variations for a processed video.

    Args:
        video_path: Path to the processed video.
        job_id: Unique identifier for the job.

    Returns:
        Dictionary mapping thumbnail names to file paths.
    """
    return {
        "thumb1": f"/downloads/{job_id}/thumb1.png",
        "thumb2": f"/downloads/{job_id}/thumb2.png",
        "thumb3": f"/downloads/{job_id}/thumb3.png",
    }