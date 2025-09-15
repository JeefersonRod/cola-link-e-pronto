# Guia de Deploy - Cola-Link-e-Pronto

Este guia fornece instruções detalhadas para fazer o deploy da aplicação Cola-Link-e-Pronto em diferentes ambientes de produção.

## 🏗️ Arquitetura de Deploy

### Componentes Necessários
1. **Frontend**: Next.js (Vercel, Netlify, ou servidor estático)
2. **Backend**: FastAPI (Railway, Heroku, ou VPS)
3. **Worker**: Celery (mesmo servidor do backend)
4. **Cache/Queue**: Redis (Redis Cloud, ou servidor dedicado)
5. **Storage**: Sistema de arquivos ou S3-compatible

## 🚀 Deploy Rápido (Recomendado)

### Opção 1: Railway + Vercel

#### Backend no Railway
1. **Crie conta no Railway**: https://railway.app
2. **Conecte seu repositório GitHub**
3. **Configure as variáveis de ambiente**:
   ```
   OPENAI_API_KEY=your_key_here
   REDIS_URL=redis://redis:6379
   PORT=8000
   ```
4. **Adicione Redis**: Railway > Add Service > Redis
5. **Deploy automático**: Push para main branch

#### Frontend no Vercel
1. **Crie conta no Vercel**: https://vercel.com
2. **Importe projeto do GitHub**
3. **Configure variáveis de ambiente**:
   ```
   BACKEND_URL=https://your-railway-app.railway.app
   ```
4. **Deploy automático**: Push para main branch

### Opção 2: Heroku (Completo)

#### Preparação
```bash
# Instale Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

#### Backend
```bash
cd backend

# Crie app
heroku create cola-link-backend

# Adicione Redis
heroku addons:create heroku-redis:mini

# Configure variáveis
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set REDIS_URL=$(heroku config:get REDIS_URL)

# Crie Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
echo "worker: celery -A celery_app worker --loglevel=info" >> Procfile

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main

# Scale worker
heroku ps:scale worker=1
```

#### Frontend
```bash
cd frontend

# Crie app
heroku create cola-link-frontend

# Configure buildpack
heroku buildpacks:set heroku/nodejs

# Configure variáveis
heroku config:set BACKEND_URL=https://cola-link-backend.herokuapp.com

# Deploy
git add .
git commit -m "Deploy frontend"
git push heroku main
```

## 🖥️ Deploy em VPS (Ubuntu)

### Preparação do Servidor
```bash
# Atualize sistema
sudo apt update && sudo apt upgrade -y

# Instale dependências
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm redis-server nginx ffmpeg

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Backend
```bash
# Clone repositório
git clone <your-repo> /var/www/cola-link-e-pronto
cd /var/www/cola-link-e-pronto/backend

# Crie ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp ../.env.example .env
# Edite .env com suas configurações

# Teste aplicação
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Configuração do Systemd (Backend)
```bash
# Crie arquivo de serviço
sudo nano /etc/systemd/system/cola-link-api.service
```

```ini
[Unit]
Description=Cola-Link-e-Pronto API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/cola-link-e-pronto/backend
Environment=PATH=/var/www/cola-link-e-pronto/backend/venv/bin
EnvironmentFile=/var/www/cola-link-e-pronto/backend/.env
ExecStart=/var/www/cola-link-e-pronto/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### Configuração do Systemd (Celery Worker)
```bash
# Crie arquivo de serviço
sudo nano /etc/systemd/system/cola-link-worker.service
```

```ini
[Unit]
Description=Cola-Link-e-Pronto Celery Worker
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/cola-link-e-pronto/backend
Environment=PATH=/var/www/cola-link-e-pronto/backend/venv/bin
EnvironmentFile=/var/www/cola-link-e-pronto/backend/.env
ExecStart=/var/www/cola-link-e-pronto/backend/venv/bin/celery -A celery_app worker --loglevel=info
Restart=always

[Install]
WantedBy=multi-user.target
```

### Inicie os Serviços
```bash
# Recarregue systemd
sudo systemctl daemon-reload

# Inicie e habilite serviços
sudo systemctl enable cola-link-api
sudo systemctl start cola-link-api
sudo systemctl enable cola-link-worker
sudo systemctl start cola-link-worker

# Verifique status
sudo systemctl status cola-link-api
sudo systemctl status cola-link-worker
```

### Frontend
```bash
cd /var/www/cola-link-e-pronto/frontend

# Instale dependências
npm install

# Configure variável de ambiente
echo "BACKEND_URL=http://localhost:8000" > .env.local

# Build para produção
npm run build

# Inicie aplicação
npm start
```

### Configuração do Nginx
```bash
# Crie configuração
sudo nano /etc/nginx/sites-available/cola-link-e-pronto
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout para uploads grandes
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Downloads
    location /downloads/ {
        proxy_pass http://localhost:8000/downloads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Limite de upload
    client_max_body_size 500M;
}
```

```bash
# Ative configuração
sudo ln -s /etc/nginx/sites-available/cola-link-e-pronto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/HTTPS (Certbot)

```bash
# Instale Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenha certificado
sudo certbot --nginx -d your-domain.com

# Renovação automática
sudo crontab -e
# Adicione: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Deploy com Docker

### Dockerfile (Backend)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instale dependências do sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Instale dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie código
COPY . .

# Exponha porta
EXPOSE 8000

# Comando padrão
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instale dependências
COPY package*.json ./
RUN npm ci --only=production

# Copie código
COPY . .

# Build aplicação
RUN npm run build

# Exponha porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./downloads:/app/downloads

  worker:
    build: ./backend
    command: celery -A celery_app worker --loglevel=info
    environment:
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./downloads:/app/downloads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend
```

```bash
# Deploy com Docker Compose
docker-compose up -d
```

## 📊 Monitoramento

### Logs
```bash
# Systemd logs
sudo journalctl -u cola-link-api -f
sudo journalctl -u cola-link-worker -f

# Docker logs
docker-compose logs -f backend
docker-compose logs -f worker
```

### Health Checks
```bash
# API health
curl http://localhost:8000/

# Redis health
redis-cli ping

# Celery health
celery -A celery_app inspect active
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de FFmpeg
```bash
# Verifique instalação
ffmpeg -version

# Reinstale se necessário
sudo apt remove ffmpeg
sudo apt install ffmpeg
```

#### 2. Erro de Redis
```bash
# Verifique status
sudo systemctl status redis-server

# Reinicie se necessário
sudo systemctl restart redis-server
```

#### 3. Erro de Permissões
```bash
# Ajuste permissões
sudo chown -R www-data:www-data /var/www/cola-link-e-pronto
sudo chmod -R 755 /var/www/cola-link-e-pronto
```

#### 4. Erro de Memória
```bash
# Monitore uso
htop
free -h

# Ajuste worker Celery
# Em celery_app.py: worker_max_memory_per_child = 200000  # 200MB
```

### Performance

#### Otimizações
1. **Use SSD** para armazenamento temporário
2. **Configure swap** se pouca RAM
3. **Use CDN** para arquivos estáticos
4. **Configure cache** no Nginx
5. **Monitore recursos** com htop/grafana

#### Scaling
1. **Horizontal**: Múltiplos workers Celery
2. **Vertical**: Mais CPU/RAM
3. **Load Balancer**: Nginx upstream
4. **Database**: PostgreSQL para metadados
5. **Storage**: S3 para arquivos grandes

## 🚨 Backup

### Dados Importantes
```bash
# Scripts de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Backup configurações
tar -czf backup_config_$DATE.tar.gz /var/www/cola-link-e-pronto/.env /etc/nginx/sites-available/

# Backup Redis (se necessário)
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup_redis_$DATE.rdb

# Limpeza de arquivos temporários antigos
find /tmp/video_jobs -type f -mtime +7 -delete
find /tmp/downloads -type f -mtime +1 -delete
```

---

**Para suporte adicional, consulte a documentação ou abra uma issue no GitHub.**

