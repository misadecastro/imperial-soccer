# Quickstart: Deploy do Frontend no Render (container)

**Feature**: 024-frontend-docker-render | **Date**: 2026-07-28

## 1. Teste local da imagem

```bash
# Contexto de build = src/frontend
cd src/frontend
docker build -t imperial-front .

# Rodar apontando para o backend (local ou já implantado)
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e API_URL="http://localhost:5179/api/v1" \
  imperial-front

# Verificações
curl -s http://localhost:8080/          | head -5      # index.html (200)
curl -s http://localhost:8080/env.js                   # window.__env = { apiUrl: "..." }
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/students   # 200 (fallback SPA)
```

Abra `http://localhost:8080` no navegador e confirme que a aplicação carrega.

## 2. Criar o Web Service do frontend no Render

Opção A — **Blueprint** (`render.yaml` com o 2º serviço): New + → Blueprint → o Render mostra os
dois serviços (backend + frontend); preencha `API_URL` do frontend.

Opção B — **Manual**: New + → Web Service → conectar o repo:
- Runtime: **Docker**
- **Root Directory**: `src/frontend`
- **Dockerfile Path**: `Dockerfile`
- **Health Check Path**: `/`
- Plano: **Free**

## 3. Variável de ambiente

| Variável | Valor |
|---|---|
| `API_URL` | URL pública do backend, ex.: `https://imperial-api.onrender.com/api/v1` |

(`PORT` é gerenciada pelo Render — não definir.)

## 4. Liberar o frontend no CORS do backend (dependência cruzada)

No serviço do **backend** (feature 023), incluir a URL pública do frontend em
`Cors__AllowedOrigins__0`, ex.: `https://imperial-front.onrender.com` (sem barra final) — e
redeploy do backend. Sem isso, o navegador bloqueia as chamadas.

## 5. Validar o deploy (mapa de aceitação)

| # | Verificação | Esperado |
|---|---|---|
| 1 | `GET https://<front>.onrender.com/` | `200`, app carrega (US1) |
| 2 | `GET https://<front>.onrender.com/env.js` | `apiUrl` = URL do backend (US2) |
| 3 | Login pela interface hospedada | sucesso, sem erro de CORS/rede, sem `localhost` (US2) |
| 4 | Abrir/recarregar uma rota interna (ex.: `/students`) | tela correta, sem 404 (US3) |
| 5 | Trocar `API_URL` e redeploy | app passa a usar o novo backend sem alterar código (SC-005) |

## 6. Observações

- **Plano free**: o serviço hiberna após ~15 min sem tráfego; a 1ª requisição depois demora
  alguns segundos — normal.
- **Sem segredos** no frontend; `API_URL` é uma URL pública.
