# Contrato de Runtime do Container (frontend)

**Feature**: 024-frontend-docker-render | **Date**: 2026-07-28

Contorno operacional da imagem do frontend — o que consome, expõe e garante.

## Entradas (variáveis de ambiente)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `API_URL` | Sim (produção) | URL pública da API do backend |
| `PORT` | Injetada pela plataforma | Porta em que o nginx escuta (fallback `8080`) |

## Porta / rede

- O container escuta em `0.0.0.0:${PORT}` (nginx). TLS terminado na borda do Render.

## Comportamento HTTP

| Caminho | Resposta |
|---|---|
| `/` | `200` — `index.html` da aplicação (serve de health check) |
| `/env.js` | `200` — `window.__env = { apiUrl: "…" }` (gerado no startup) |
| assets versionados (`*.js`, `*.css`, imagens) | `200` — arquivos estáticos |
| rota interna inexistente no servidor (ex.: `/students`, refresh) | `200` — `index.html` (fallback SPA) |

## Garantias

- **Deep link / refresh** em qualquer rota da aplicação resolve para `index.html` (roteamento
  client-side do Angular preservado).
- **Endereço da API** vem de `env.js` (gerado de `API_URL`) — trocável sem rebuild.
- A imagem final serve **apenas** os estáticos (sem Node/Angular CLI embutidos).

## Contrato de build (para o Render)

- **Dockerfile Path**: `src/frontend/Dockerfile` (Root Directory `src/frontend` → `Dockerfile`)
- **Docker Build Context**: `src/frontend`
- **Runtime**: container Linux; imagem final `nginx:alpine`.
- **Health Check Path**: `/`
- **Plano**: free.

## Dependência cruzada

A URL pública deste serviço deve ser adicionada a `Cors__AllowedOrigins` do backend (feature
023) para o navegador não bloquear as chamadas.
