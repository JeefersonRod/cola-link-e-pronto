"use client";

import React, { useEffect, useState } from "react";

/**
 * Home page component for Cola‑Link‑e‑Pronto.
 *
 * This React component implements a simple interface where users can
 * paste a video URL (or upload a file) and select one or more niches.
 * On submission, it sends a request to the backend API and then
 * repeatedly polls the job status endpoint until the job finishes.
 */
export default function HomePage() {
  // Read API URL from environment (defaults to localhost if not set).
  const API =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";

  const [url, setUrl] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Handle niche selection
  const toggleNiche = (n: string) => {
    setNiches((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  /**
   * Submit a processing job to the backend.
   */
  async function startJob() {
    setLoading(true);
    setError(null);
    setStatus(null);
    setProgress(0);
    setJobId(null);
    try {
      const resp = await fetch(`${API}/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, niches }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Erro ao iniciar processamento");
      }
      const data = (await resp.json()) as { job_id: string };
      setJobId(data.job_id);
      pollStatus(data.job_id);
    } catch (e: any) {
      setError(e.message || "Erro ao iniciar processamento");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Poll the backend for job status every 1.5 seconds until the job
   * finishes.
   */
  function pollStatus(id: string) {
    const intervalId = setInterval(async () => {
      try {
        const r = await fetch(`${API}/job-status/${id}`);
        if (!r.ok) throw new Error("Falha ao obter status");
        const s = await r.json();
        setStatus(s);
        // Progress is returned as float 0–1; store separately
        if (s.progress !== undefined) setProgress(s.progress);
        if (s.status === "completed" || s.status === "failed") {
          clearInterval(intervalId);
        }
      } catch (e: any) {
        setError(e.message);
        clearInterval(intervalId);
      }
    }, 1500);
  }

  /**
   * Copy text to clipboard and provide simple feedback.
   */
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado para a área de transferência!");
    } catch {
      alert("Não foi possível copiar.");
    }
  }

  // Styles depending on dark mode
  const background = darkMode ? "#111" : "#f7f7f7";
  const color = darkMode ? "#f7f7f7" : "#111";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const borderColor = darkMode ? "#333" : "#ddd";

  return (
    <main
      style={{
        maxWidth: 840,
        margin: "32px auto",
        padding: 16,
        background,
        color,
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Cola‑Link‑e‑Pronto</h1>
        <button
          onClick={toggleDarkMode}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            background: cardBg,
            color,
            cursor: "pointer",
          }}
        >
          {darkMode ? "Modo claro" : "Modo escuro"}
        </button>
      </div>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Cole a URL do vídeo (YouTube/Drive) e gere cortes 9×16 prontos com
        título, descrição, hashtags e thumbnails.
      </p>

      {/* Input para URL */}
      <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
        URL do vídeo
      </label>
      <input
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          border: `1px solid ${borderColor}`,
          borderRadius: 8,
          marginBottom: 16,
          background: cardBg,
          color,
        }}
      />

      {/* Seletores de nicho */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
          Nichos
        </label>
        {[
          { id: "motivacional", label: "Motivacional" },
          { id: "humor", label: "Humor" },
          { id: "educacao", label: "Educação" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggleNiche(opt.id)}
            style={{
              padding: "8px 12px",
              marginRight: 8,
              marginBottom: 8,
              borderRadius: 999,
              border: niches.includes(opt.id)
                ? `2px solid ${color}`
                : `1px solid ${borderColor}`,
              background: niches.includes(opt.id) ? color : "transparent",
              color: niches.includes(opt.id) ? background : color,
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Botão para iniciar o processamento */}
      <button
        onClick={startJob}
        disabled={loading || !url || niches.length === 0}
        style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: loading ? "#888" : "#0070f3",
          color: "#fff",
          border: "none",
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Gerando..." : "Gerar agora"}
      </button>

      {error && (
        <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>
      )}

      {/* Barra de progresso */}
      {jobId && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              height: 8,
              background: borderColor,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.round(progress * 100)}%`,
                background: "#22c55e",
                transition: "width 1s ease",
              }}
            />
          </div>
          <p style={{ marginTop: 4, fontSize: 14 }}>
            {Math.round(progress * 100)}% concluído
          </p>
        </div>
      )}

      {/* Exibir resultados quando disponíveis */}
      {status?.status === "completed" && status.result && (
        <div
          style={{
            marginTop: 32,
            padding: 16,
            background: cardBg,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h2 style={{ marginBottom: 12 }}>Resultados</h2>
          <div style={{ marginBottom: 16 }}>
            <strong>Título:</strong> {status.result.title}
            <button
              onClick={() => copyToClipboard(status.result.title)}
              style={{ marginLeft: 8, cursor: "pointer" }}
            >
              Copiar
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Descrição:</strong>
            <p style={{ whiteSpace: "pre-wrap" }}>{status.result.description}</p>
            <button
              onClick={() => copyToClipboard(status.result.description)}
              style={{ cursor: "pointer" }}
            >
              Copiar descrição
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Hashtags:</strong> {status.result.hashtags.join(" ")}
            <button
              onClick={() => copyToClipboard(status.result.hashtags.join(" "))}
              style={{ marginLeft: 8, cursor: "pointer" }}
            >
              Copiar hashtags
            </button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Score de Viralidade:</strong> {status.result.virality_score}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Downloads:</strong>
            <ul>
              {Object.entries(status.result.downloads).map(([name, path]) => (
                <li key={name} style={{ marginBottom: 4 }}>
                  <a
                    href={String(path)}
                    target="_blank"
                    style={{ color: "#0070f3", textDecoration: "underline" }}
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}