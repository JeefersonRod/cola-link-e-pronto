"""
Main FastAPI application for the Cola‑Link‑e‑Pronto backend.

This module exposes three primary endpoints:

* **POST /process-video** – Kick off asynchronous processing for a given
  video URL and list of niches. Returns a unique job identifier that can
  subsequently be polled for status.
* **GET /job-status/{job_id}** – Retrieve the current status of a
  previously submitted job. When complete, the response includes links
  to the generated video, subtitles, thumbnails and metadata.
* **GET /health** – Simple health check endpoint to verify that the
  service is running.

Internally, jobs are tracked in memory using a dictionary. The
background task simulates long‑running processing using asyncio.sleep.
In a production deployment, you would replace the simulated delays
with calls into the media processing and content optimisation modules.
"""

import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import BackgroundTasks, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import content_optimizer, media_processor, thumbnail_generator


app = FastAPI(title="Cola‑Link‑e‑Pronto API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProcessVideoRequest(BaseModel):
    """Model representing a video processing request."""

    url: str = Field(..., description="URL do vídeo (YouTube, Google Drive ou arquivo hospedado)")
    niches: List[str] = Field(
        default_factory=list,
        description="Lista de nichos selecionados (p. ex. ['motivacional','humor'])",
    )


class JobStatusResponse(BaseModel):
    """Model representing the status of an ongoing or completed job."""

    status: str
    progress: float = 0.0
    result: Optional[dict] = None
    error: Optional[str] = None


class JobRecord(BaseModel):
    """Internal model used to track jobs in memory."""

    status: str
    progress: float
    submitted_at: datetime
    result: Optional[dict]
    error: Optional[str]


# In‑memory store for jobs. In a real application this would be
# persisted in a database or Redis.
jobs: Dict[str, JobRecord] = {}


@app.get("/health")
async def health_check() -> dict:
    """Return basic health status information."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/process-video", response_model=dict)
async def process_video(request: ProcessVideoRequest, background_tasks: BackgroundTasks) -> dict:
    """Submit a new processing job and return a unique job identifier.

    Args:
        request: Body containing the video URL and selected niches.
        background_tasks: FastAPI background task manager.

    Returns:
        Dictionary containing the assigned job identifier.
    """
    # Generate a unique job ID
    job_id = str(uuid.uuid4())

    # Store initial job record
    jobs[job_id] = JobRecord(
        status="processing", progress=0.0, submitted_at=datetime.utcnow(), result=None, error=None
    )

    # Schedule background processing
    background_tasks.add_task(_simulate_processing, job_id, request.url, request.niches)

    return {"job_id": job_id}


@app.get("/job-status/{job_id}", response_model=JobStatusResponse)
async def job_status(job_id: str) -> JobStatusResponse:
    """Retrieve the status of a specific job.

    Args:
        job_id: Unique identifier for the job.

    Returns:
        Current job status and, if completed, the processing result.
    """
    record = jobs.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(
        status=record.status,
        progress=record.progress,
        result=record.result,
        error=record.error,
    )


async def _simulate_processing(job_id: str, url: str, niches: List[str]) -> None:
    """Simulate media processing pipeline.

    This function represents the core pipeline for downloading, processing
    and generating all outputs for the given video. The implementation
    below is a placeholder that sleeps for a few seconds and then
    constructs a dummy result. Replace this with calls into real
    components defined in media_processor, content_optimizer and
    thumbnail_generator.

    Args:
        job_id: Unique identifier for the job being processed.
        url: URL of the video to process.
        niches: List of user‑selected niches.
    """
    try:
        # Simulate downloading and preprocessing (0–30%)
        await _update_progress(job_id, 0.1)
        await asyncio.sleep(2)
        await _update_progress(job_id, 0.3)

        # Simulate audio transcription (30–60%)
        await asyncio.sleep(2)
        await _update_progress(job_id, 0.6)

        # Simulate content optimisation (60–90%)
        await asyncio.sleep(2)
        await _update_progress(job_id, 0.9)

        # Simulate final packaging (90–100%)
        await asyncio.sleep(1)
        await _update_progress(job_id, 1.0)

        # Construct dummy result
        jobs[job_id].result = {
            "title": "Vídeo Incrível de Motivação! 🔥",
            "description": "Conteúdo exclusivo! Siga para mais conteúdo como este.",
            "hashtags": [
                "#motivacao",
                "#inspiracao",
                "#sucesso",
                "#shorts",
                "#viral",
                "#tiktok",
            ],
            "virality_score": 85,
            "downloads": {
                "video": f"/downloads/{job_id}/video.mp4",
                "subtitles": f"/downloads/{job_id}/legendado.srt",
                "thumbnail_1": f"/downloads/{job_id}/thumb1.png",
                "thumbnail_2": f"/downloads/{job_id}/thumb2.png",
                "thumbnail_3": f"/downloads/{job_id}/thumb3.png",
            },
        }
        jobs[job_id].status = "completed"
    except Exception as exc:
        jobs[job_id].status = "failed"
        jobs[job_id].error = str(exc)


async def _update_progress(job_id: str, progress: float) -> None:
    """Helper to update job progress in memory."""
    record = jobs.get(job_id)
    if record:
        record.progress = progress
        jobs[job_id] = record