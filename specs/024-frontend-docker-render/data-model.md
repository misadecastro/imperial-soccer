# Data Model: Superfície de Configuração (frontend)

**Feature**: 024-frontend-docker-render | **Date**: 2026-07-28

Sem entidades de domínio. O "modelo" é a **configuração de runtime** do container do frontend.

## Variáveis de ambiente do container

| Variável | Consumidor | Obrigatória | Default | Descrição |
|---|---|---|---|---|
| `API_URL` | `env.js` → `window.__env.apiUrl` | **Sim** (produção) | `http://localhost:5179/api/v1` | URL pública da API do backend (ex.: `https://<backend>.onrender.com/api/v1`) |
| `PORT` | `nginx.conf` (`listen ${PORT}`) | Auto (Render injeta) | `8080` | Porta em que o nginx escuta |

## Fluxo da configuração de runtime

```text
API_URL (env do Render)
   └─ docker-entrypoint.sh  →  escreve /usr/share/nginx/html/env.js:
                                 window.__env = { apiUrl: "<API_URL>" };
index.html  →  <script src="env.js"></script>  (carrega antes do app)
environment.ts  →  get apiUrl() => window.__env?.apiUrl ?? "http://localhost:5179/api/v1"
serviços Angular  →  usam environment.apiUrl (transparente)
```

## Regras / comportamento

- **RV-001**: Em produção, `API_URL` deve apontar para a URL pública do backend implantado
  (feature 023). Sem ela, o app cai no fallback `localhost` (inválido em produção) — FR-005.
- **RV-002**: `PORT` é injetada pela plataforma; o nginx escuta nela. Fora da plataforma, `8080`.
- **RV-003**: A URL pública **do frontend** deve constar em `Cors__AllowedOrigins` do backend,
  senão o navegador bloqueia as chamadas (dependência cruzada com a feature 023).
- **RV-004**: `env.js` não é sensível (URL pública); pode ser servido abertamente.

## Não há segredos

O frontend não possui segredos. `API_URL` é uma URL pública. Nada a ocultar no repositório ou
na imagem além de boas práticas de `.dockerignore` (não copiar `node_modules`/`dist` locais).
