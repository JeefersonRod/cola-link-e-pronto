"""
Module responsible for optimising content for Cola‑Link‑e‑Pronto.

This module exposes a function `generate_metadata` which, given the
transcribed content and user‑selected niches, produces a title,
description, list of hashtags and a virality score. In a production
environment, this function would leverage large language models
(LLMs) and custom heuristics. Here we provide a minimal
implementation for demonstration purposes.
"""

from typing import Dict, List


def generate_metadata(transcript: str, niches: List[str]) -> Dict[str, any]:
    """Generate title, description, hashtags and virality score.

    Args:
        transcript: Full transcript of the video.
        niches: User selected niches.

    Returns:
        A dictionary containing title, description, hashtags and
        virality score.
    """
    # Placeholder logic: pick a generic title based on first niche
    primary_niche = niches[0] if niches else "video"
    title = f"{primary_niche.capitalize()} incrível!"
    description = f"Este é um {primary_niche} imperdível. Compartilhe!"
    hashtags = [f"#{primary_niche}", "#shorts", "#viral"]
    virality_score = 75  # dummy constant
    return {
        "title": title,
        "description": description,
        "hashtags": hashtags,
        "virality_score": virality_score,
    }