# Cola-Link-e-Pronto

Aplicação para transformar links de vídeo em **shorts prontos** (9:16) com título, descrição e hashtags otimizados.

## Pastas
- `frontend/` – Next.js (UI). Veja `.env.local.example` e `package.json`.
- `backend/` – FastAPI com endpoints `/process-video`, `/job-status` e `/health`.
- `docs/` – Documentação completa (README, DEPLOY, ENTREGA_FINAL, TODO).

## Dev rápido
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd ../frontend && npm install
npm run dev
```
Configure `NEXT_PUBLIC_API_URL` do frontend apontando para a API (ex.: `http://localhost:8000`).

Mais detalhes em `docs/DEPLOY.md` e `docs/README.md`.