'use client';
import React, { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type JobResponse = {
  job_id: string;
};

type JobStatus = {
  status: string;
  progress?: number;
  result?: any;
  error?: string;
};

export default function Page() {
  const [url, setUrl] = useState('');
  const [niches, setNiches] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string>('');
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const toggleNiche = (n: string) => {
    setNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  async function startJob() {
    setLoading(true);
    setMsg('');
    setStatus(null);
    try {
      const resp = await fetch(`${API}/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, niches })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data: JobResponse = await resp.json();
      setJobId(data.job_id);
      pollStatus(data.job_id);
    } catch (e: any) {
      setMsg(e.message || 'Erro ao iniciar processamento');
    } finally {
      setLoading(false);
    }
  }

  async function pollStatus(id: string) {
    const interval = setInterval(async () => {
      const r = await fetch(`${API}/job-status/${id}`);
      const s: JobStatus = await r.json();
      setStatus(s);
      if (s.status === 'completed' || s.status === 'failed') {
        clearInterval(interval);
      }
    }, 1500);
  }

  return (
    <main style={{ maxWidth: 720, margin: '32px auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Cola-Link-e-Pronto</h1>
      <p style={{ opacity: .75, marginBottom: 24 }}>Cole a URL do YouTube/Drive e gere vídeos 9:16 prontos com título, descrição e hashtags.</p>

      <label style={{ display:'block', fontWeight:600, marginBottom:8 }}>URL do vídeo</label>
      <input
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={{ width:'100%', padding:12, border:'1px solid #ccc', borderRadius:8, marginBottom:16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <label style={{ display:'block', fontWeight:600, marginBottom:8 }}>Nichos</label>
        {['motivacional','humor','educacao'].map(n => (
          <button key={n}
            onClick={() => toggleNiche(n)}
            style={{ padding:'8px 12px', marginRight:8, marginBottom:8, borderRadius:999, border: niches.includes(n)?'2px solid #111':'1px solid #999', background: niches.includes(n)?'#eee':'transparent' }}>
            {n}
          </button>
        ))}
      </div>

      <button onClick={startJob} disabled={loading || !url}
        style={{ padding:'12px 16px', borderRadius:10, background:'#111', color:'#fff', border:'none', cursor:'pointer' }}>
        {loading ? 'Gerando...' : 'Gerar agora'}
      </button>

      {msg && <p style={{ color:'crimson', marginTop:12 }}>{msg}</p>}

      {jobId && <div style={{ marginTop:24 }}>
        <h3>Job: {jobId}</h3>
        <pre style={{ background:'#f7f7f7', padding:12, borderRadius:8, overflow:'auto' }}>{JSON.stringify(status, null, 2)}</pre>
        {status?.result?.downloads && (
          <div>
            <h4>Downloads</h4>
            <ul>
              {Object.entries(status.result.downloads).map(([k,v]) => (
                <li key={k}><a href={String(v)} target="_blank">{k}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>}
    </main>
  );
}