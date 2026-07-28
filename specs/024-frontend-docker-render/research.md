# Research: Containerização do Frontend para Deploy no Render

**Feature**: 024-frontend-docker-render | **Date**: 2026-07-28

## Decisão 1 — Dockerfile multi-stage (node build → nginx runtime)

- **Decision**: Estágio 1 `node:20-alpine`: `npm ci` + `npm run build` (`ng build`). Estágio 2
  `nginx:alpine`: copia a saída estática e serve. Imagem final não contém Node/CLI.
- **Rationale**: Imagem enxuta e segura; nginx é servidor estático maduro com fallback SPA e
  bom desempenho. Cache de camadas (copiar `package*.json` + `npm ci` antes do código).
- **Alternatives considered**: servir com `ng serve`/Node em produção (pesado, não recomendado);
  usar Static Site do Render (o usuário pediu **Web Service**, como no backend).

## Decisão 2 — Saída do build é `dist/imperial-frontend/browser/`

- **Decision**: Copiar `dist/imperial-frontend/browser/` (não `dist/imperial-frontend/`) para o
  diretório servido pelo nginx (`/usr/share/nginx/html`).
- **Rationale**: O builder do Angular 18 é `@angular-devkit/build-angular:application` (esbuild),
  que coloca os arquivos servíveis dentro de `browser/`. Confirmado inspecionando `angular.json`
  e o `dist/` atual.
- **Alternatives considered**: assumir a raiz `dist/imperial-frontend/` (erraria — geraria 404).

## Decisão 3 — Fallback SPA no nginx

- **Decision**: Bloco `location / { try_files $uri $uri/ /index.html; }` para roteamento
  client-side do Angular (deep links e refresh).
- **Rationale**: Sem isso, acessar/recarregar uma rota interna (ex.: `/students`) retorna 404 do
  servidor (FR-007). `<base href="/">` já está correto para servir na raiz.
- **Alternatives considered**: sem fallback (quebra deep link); hash routing (mudaria a app).

## Decisão 4 — Escutar na porta injetada (`PORT`) via envsubst

- **Decision**: `nginx.conf.template` com `listen ${PORT};`; o entrypoint faz
  `envsubst '${PORT}' < template > /etc/nginx/conf.d/default.conf` (fallback `8080`).
- **Rationale**: O Render injeta `PORT` em runtime; a porta não pode ser fixa (FR-002). Limitar
  o `envsubst` a `${PORT}` evita clobber das variáveis de runtime do nginx (`$uri`, `$host`).
- **Alternatives considered**: usar o mecanismo `/etc/nginx/templates` do nginx (substitui todas
  as env vars — risco de estragar `$uri`); porta fixa (quebra no Render).

## Decisão 5 — Endereço da API configurável em runtime (`window.__env`)

- **Decision**: Introduzir configuração em runtime:
  - `index.html` inclui `<script src="env.js"></script>` no `<head>`.
  - `environment.ts` passa a expor `apiUrl` como getter: `window.__env?.apiUrl ?? 'http://localhost:5179/api/v1'`.
  - O entrypoint do container gera `/usr/share/nginx/html/env.js` a partir de `API_URL`:
    `window.__env = { apiUrl: "${API_URL}" };`.
  - `public/env.js` fornece o default de desenvolvimento (localhost), evitando 404 em `ng serve`.
- **Rationale**: Espelha o backend ("como foi feito com o backend"): troca-se o endereço da API
  **sem rebuild**, só mudando a variável e reiniciando (FR-005/SC-005). Mudança de código mínima
  e transparente — os serviços continuam usando `environment.apiUrl`.
- **Alternatives considered**: `environment.prod.ts` + `fileReplacements` (valor **fixado no
  build**; trocar exige rebuild — não casa com o pedido); `API_URL` como build ARG (idem, exige
  rebuild).

## Decisão 6 — `.dockerignore` e contexto de build

- **Decision**: `.dockerignore` em `src/frontend/` ignorando `node_modules`, `dist`, `.angular`,
  `*.log`, `.git`. Contexto de build = `src/frontend/`.
- **Rationale**: Contexto menor e build mais rápido; evita copiar `node_modules` local (o
  `npm ci` reinstala limpo no estágio de build).

## Decisão 7 — Segundo serviço no `render.yaml`

- **Decision**: Adicionar um segundo `services:` (web, docker) no `render.yaml` existente:
  `dockerfilePath: ./src/frontend/Dockerfile`, `dockerContext: ./src/frontend`,
  `healthCheckPath: /`, `plan: free`, `envVars: [ API_URL ]`.
- **Rationale**: Mantém a infra versionada num só Blueprint; deploy do frontend independente do
  backend (FR-009). `/` responde 200 (index) — serve de health check.
- **Alternatives considered**: `render.yaml` separado (fragmenta a infra); só configurar no
  painel (não versionado).

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Copiar a pasta errada do `dist` (sem `browser/`) → 404 | Decisão 2: copiar `dist/imperial-frontend/browser/` |
| `envsubst` estragar `$uri`/`$host` do nginx | Restringir a `envsubst '${PORT}'` (Decisão 4) |
| API URL não injetada → app chama `localhost` | `env.js` gerado no startup a partir de `API_URL`; validar no smoke test lendo `/env.js` |
| CORS bloquear o frontend | Adicionar a URL pública do frontend em `Cors__AllowedOrigins` do backend (feature 023) — passo no quickstart |
| 404 de `env.js` em `ng serve` | `public/env.js` default (localhost) servido na raiz pelo Angular |
| Deep link 404 | Fallback `try_files … /index.html` (Decisão 3) |
