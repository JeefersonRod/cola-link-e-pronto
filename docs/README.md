# Cola-Link-e-Pronto

Uma aplicação web completa para automatizar a criação de vídeos curtos (Shorts/TikTok) a partir de URLs de vídeo, incluindo edição automática, legendagem, otimização de SEO e geração de thumbnails.

## 🚀 Funcionalidades

### Processamento Automático de Vídeo
- **Download inteligente**: Suporte para YouTube, Google Drive e upload direto
- **Reframe automático**: Conversão para formato 9:16 (vertical) otimizado para Shorts
- **Edição automática**: Cortes inteligentes, normalização de áudio e legendas dinâmicas
- **Detecção de ganchos**: Identificação automática dos melhores momentos do vídeo

### Otimização de Conteúdo
- **Transcrição com IA**: Usando Whisper para transcrição precisa com timestamps
- **Geração de conteúdo**: Títulos, descrições e hashtags otimizadas por nicho
- **Score de viralidade**: Análise preditiva do potencial viral do conteúdo
- **Thumbnails A/B**: Geração de múltiplas variações de thumbnail com texto

### Interface Moderna
- **Design responsivo**: Interface otimizada para desktop e mobile
- **Progresso em tempo real**: Acompanhamento visual do processamento
- **Download facilitado**: Botões diretos para vídeo, legendas e thumbnails
- **Cópia rápida**: Funcionalidade de copiar conteúdo para área de transferência

## 🏗️ Arquitetura

### Frontend (Next.js)
- **Framework**: Next.js 14 com TypeScript
- **Estilização**: Tailwind CSS para design responsivo
- **Estado**: React Hooks para gerenciamento de estado
- **API Routes**: Integração com backend via API routes

### Backend (FastAPI)
- **Framework**: FastAPI com Python 3.11
- **Processamento assíncrono**: Celery com Redis para filas
- **IA e ML**: OpenAI GPT, Whisper para transcrição
- **Processamento de mídia**: FFmpeg para edição de vídeo

### Serviços de Mídia
- **FFmpeg**: Reframe, cortes, normalização de áudio, legendas
- **Whisper**: Transcrição de áudio com timestamps precisos
- **OpenAI GPT**: Detecção de ganchos e geração de conteúdo
- **OpenCV + PIL**: Processamento e geração de thumbnails

## 📋 Pré-requisitos

### Sistema
- Python 3.11+
- Node.js 18+
- Redis Server
- FFmpeg

### APIs
- Chave da API OpenAI

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd cola-link-e-pronto
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Instale as dependências do backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 4. Instale as dependências do frontend
```bash
cd ../frontend
npm install
# ou
pnpm install
```

### 5. Inicie os serviços

#### Redis (em terminal separado)
```bash
redis-server
```

#### Backend (em terminal separado)
```bash
cd backend
source venv/bin/activate
python main.py
```

#### Celery Worker (em terminal separado)
```bash
cd backend
source venv/bin/activate
celery -A celery_app worker --loglevel=info
```

#### Frontend (em terminal separado)
```bash
cd frontend
npm run dev
# ou
pnpm dev
```

## 🚀 Uso

1. Acesse `http://localhost:3000`
2. Cole a URL do vídeo ou faça upload de um arquivo
3. Selecione o(s) nicho(s) do conteúdo
4. Clique em "Gerar Agora"
5. Acompanhe o progresso em tempo real
6. Baixe os arquivos gerados ou copie o conteúdo

## 📁 Estrutura do Projeto

```
cola-link-e-pronto/
├── frontend/                 # Aplicação Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/         # API routes
│   │   │   ├── page.tsx     # Página principal
│   │   │   └── layout.tsx   # Layout base
│   │   └── components/      # Componentes React
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # API FastAPI
│   ├── main.py              # Servidor principal
│   ├── models.py            # Modelos de dados
│   ├── tasks.py             # Tarefas do Celery
│   ├── celery_app.py        # Configuração do Celery
│   ├── media_processor.py   # Processamento de mídia
│   ├── content_optimizer.py # Otimização de conteúdo
│   ├── thumbnail_generator.py # Geração de thumbnails
│   └── requirements.txt
├── .env.example             # Exemplo de variáveis de ambiente
└── README.md               # Este arquivo
```

## 🔧 Configuração Avançada

### Modelos Whisper
Por padrão, usa o modelo `base`. Para melhor qualidade:
```python
# Em media_processor.py
self.whisper_model = whisper.load_model("large-v3")
```

### Configurações de Vídeo
Ajuste as configurações em `media_processor.py`:
- Resolução de saída: `target_width = 1080, target_height = 1920`
- Qualidade de vídeo: `vcodec='libx264'`
- Normalização de áudio: `target_lufs=-14`

### Personalização de Thumbnails
Modifique estilos em `thumbnail_generator.py`:
- Fontes e tamanhos
- Cores e filtros
- Posicionamento de texto

## 🐛 Solução de Problemas

### Erro de FFmpeg
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Baixe de https://ffmpeg.org/download.html
```

### Erro de Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis
```

### Erro de Whisper
```bash
# Instale dependências de áudio
sudo apt install libsndfile1  # Linux
```

## 📊 Monitoramento

### Logs do Celery
```bash
celery -A celery_app worker --loglevel=debug
```

### Status do Redis
```bash
redis-cli ping
```

### Métricas de Performance
- Tempo médio de processamento: 2-5 minutos por vídeo
- Suporte a vídeos até 500MB
- Processamento paralelo de múltiplos jobs

## 🔒 Segurança

### Produção
- Configure `SECRET_KEY` forte
- Use HTTPS para todas as comunicações
- Limite upload de arquivos
- Configure CORS adequadamente
- Use variáveis de ambiente para credenciais

### Rate Limiting
Implemente rate limiting para evitar abuso:
```python
# Em main.py
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy para Vercel ou Netlify
```

### Backend (Railway/Heroku)
```bash
# Configure Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
worker: celery -A celery_app worker --loglevel=info
```

### Docker (Opcional)
```dockerfile
# Dockerfile para backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação técnica
- Verifique os logs de erro

## 🔄 Roadmap

### Próximas Funcionalidades
- [ ] Suporte a mais plataformas (TikTok, Instagram)
- [ ] Editor de vídeo visual
- [ ] Templates de thumbnail personalizáveis
- [ ] Integração com redes sociais
- [ ] Analytics de performance
- [ ] API pública
- [ ] Processamento em lote
- [ ] Suporte a múltiplos idiomas

### Melhorias Técnicas
- [ ] Cache inteligente
- [ ] Otimização de performance
- [ ] Testes automatizados
- [ ] Documentação da API
- [ ] Monitoramento avançado
- [ ] Backup automático
- [ ] Escalabilidade horizontal

---

**Desenvolvido com ❤️ pela equipe Manus AI**

