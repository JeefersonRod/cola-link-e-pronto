from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List, Dict
import uuid

app = FastAPI(title="Cola-Link-e-Pronto API")

class ProcessRequest(BaseModel):
    url: HttpUrl
    niches: List[str]

jobs: Dict[str, Dict] = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/process-video")
def process_video(req: ProcessRequest):
    job_id = str(uuid.uuid4())[:8]
    # Simulação de processamento: cria um registro com progresso
    jobs[job_id] = {
        "status": "completed",
        "progress": 100,
        "result": {
            "title": "Título otimizado para Shorts",
            "description": "Descrição curta com CTA. Siga para mais.",
            "hashtags": ["#shorts","#tiktok","#motivacional","#humor","#educacao"],
            "virality_score": 84,
            "downloads": {
                "video_mp4": "https://example.com/video.mp4",
                "subtitles_srt": "https://example.com/subtitles.srt",
                "thumb_1": "https://example.com/thumb1.png",
                "thumb_2": "https://example.com/thumb2.png",
                "thumb_3": "https://example.com/thumb3.png"
            }
        }
    }
    return {"job_id": job_id}

@app.get("/job-status/{job_id}")
def job_status(job_id: str):
    data = jobs.get(job_id)
    if not data:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    return data