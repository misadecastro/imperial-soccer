---
description: "Task list for feature 024-frontend-docker-render"
---

# Tasks: Containerização do Frontend para Deploy no Render

**Input**: Design documents from `/specs/024-frontend-docker-render/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Sem tarefas de teste automatizado (feature de infra; TDD não solicitado). Validação
por smoke test local (`docker build`/`docker run` + `curl`) e pelo mapa de aceitação do
`quickstart.md`.

**Organization**: Tarefas agrupadas por user story (P1 → P2 → P3). US1 = container servindo o
app no Render (MVP). US2 = app apontando para o backend por config. US3 = navegação SPA.

> Deploy no Render e o passo de liberar a URL do front no CORS do backend (feature 023) são
> **operacionais** (painel do Render), não automatizáveis a partir do repositório.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência mútua)
- **[Story]**: US1, US2, US3

## Path Conventions

- Frontend: `src/frontend/...` (Dockerfile, `.dockerignore`, nginx template, entrypoint na raiz do projeto Angular). `render.yaml` na raiz do repo.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirmar baseline: `ng build` em `src/frontend` conclui sem erros (saída em `dist/imperial-frontend/browser/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Sem infraestrutura nova bloqueante — o app já existe e builda. Esta feature apenas
o empacota e o parametriza.

**Checkpoint**: Baseline verde → US1 pode começar.

---

## Phase 3: User Story 1 - Publicar o frontend como container no Render (Priority: P1) 🎯 MVP

**Goal**: Imagem que builda o Angular e serve os estáticos por nginx, escutando na porta `PORT`;
acessível por HTTPS no Render (Web Service free).

**Independent Test**: `docker build` + `docker run -e PORT=8080` e `curl http://localhost:8080/`
→ `200` com o `index.html`; app carrega no navegador.

### Implementation for User Story 1

- [X] T002 [P] [US1] Criar `src/frontend/.dockerignore` ignorando `node_modules`, `dist`, `.angular`, `**/*.log`, `.git`, `.vscode` (research Decisão 6)
- [X] T003 [P] [US1] Criar `src/frontend/nginx.conf.template` com `server { listen ${PORT}; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }` (porta via envsubst + fallback SPA — research Decisões 3 e 4)
- [X] T004 [US1] Criar `src/frontend/docker-entrypoint.sh`: `: "${PORT:=8080}"`; `envsubst '${PORT}' < nginx.conf.template > /etc/nginx/conf.d/default.conf`; gerar `/usr/share/nginx/html/env.js` com `window.__env = { apiUrl: "${API_URL:-http://localhost:5179/api/v1}" };`; `exec nginx -g 'daemon off;'` (serve US1 = porta e US2 = env.js — research Decisões 4 e 5)
- [X] T005 [US1] Criar `src/frontend/Dockerfile` multi-stage: `node:20-alpine` (`COPY package*.json`, `npm ci`, `COPY .`, `npm run build`) → `nginx:alpine` (`COPY --from=build /app/dist/imperial-frontend/browser /usr/share/nginx/html`, copiar `nginx.conf.template` e `docker-entrypoint.sh`, `chmod +x`, `ENV PORT=8080`, `EXPOSE 8080`, `ENTRYPOINT ["/docker-entrypoint.sh"]`) — research Decisões 1 e 2
- [X] T006 [US1] Smoke test local: `docker build -t imperial-front src/frontend` e `docker run --rm -p 8080:8080 -e PORT=8080 -e API_URL="http://localhost:5179/api/v1" imperial-front`; validar `curl /` → 200 e `curl /env.js` mostra o `apiUrl`

**Checkpoint**: Imagem builda, sobe na porta de `PORT` e serve a aplicação.

---

## Phase 4: User Story 2 - Conectar o frontend ao backend implantado (Priority: P2)

**Goal**: A aplicação hospedada lê o endereço da API de `window.__env` (gerado de `API_URL`),
apontando para o backend implantado — trocável sem rebuild; login funciona ponta a ponta.

**Independent Test**: Rodar o container com `-e API_URL="https://<backend>/api/v1"`; confirmar
que `/env.js` reflete a URL e que o app faz as chamadas para lá (não `localhost`).

### Implementation for User Story 2

- [X] T007 [P] [US2] Editar `src/frontend/src/environments/environment.ts`: `apiUrl` vira getter que lê `(window as any).__env?.apiUrl ?? 'http://localhost:5179/api/v1'`
- [X] T008 [P] [US2] Editar `src/frontend/src/index.html`: adicionar `<script src="env.js"></script>` no `<head>` (antes do app)
- [X] T009 [P] [US2] Criar `src/frontend/public/env.js` com o default de dev: `window.__env = { apiUrl: "http://localhost:5179/api/v1" };` (evita 404 em `ng serve`)
- [X] T010 [US2] Editar `render.yaml` (raiz): adicionar um 2º serviço `type: web`, `runtime: docker`, `dockerfilePath: ./src/frontend/Dockerfile`, `dockerContext: ./src/frontend`, `healthCheckPath: /`, `plan: free`, `envVars: [ { key: API_URL, sync: false } ]`
- [X] T011 [US2] Validar override: `docker run -e API_URL="https://exemplo-backend/api/v1"` → `curl /env.js` mostra `https://exemplo-backend/api/v1`; `ng build` continua verde com o getter

**Checkpoint**: `env.js` reflete `API_URL`; app usa o backend implantado sem alterar código.

---

## Phase 5: User Story 3 - Navegação SPA (deep links e refresh) (Priority: P3)

**Goal**: Rotas internas abertas diretamente ou recarregadas resolvem para `index.html`, sem 404.

**Independent Test**: Com o container no ar, `curl -o /dev/null -w "%{http_code}" http://localhost:8080/students` → `200`; no navegador, abrir/recarregar uma rota interna mostra a tela certa.

### Implementation for User Story 3

- [X] T012 [US3] Validar o fallback SPA (regra `try_files` do `nginx.conf.template`, T003): `docker run` e testar `GET /students` e `GET /dashboard` → `200` servindo `index.html` (sem 404)

**Checkpoint**: Deep links e refresh funcionam.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T013 [P] Documentar o deploy do frontend na seção de deploy do `CLAUDE.md` (apontar `API_URL`, `render.yaml`, e o passo de adicionar a URL do front em `Cors__AllowedOrigins` do backend)
- [ ] T014 Executar o mapa de aceitação do `quickstart.md` (5 verificações: `/`, `/env.js`, login sem CORS/`localhost`, deep link/refresh, troca de `API_URL` sem rebuild) — inclui adicionar a URL pública do front no CORS do backend (feature 023) e redeploy do backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: sem tarefas.
- **US1 (Phase 3)**: base — a imagem precisa existir e servir.
- **US2 (Phase 4)**: o `env.js` é gerado pelo entrypoint (T004, US1); T007–T009 fazem o app consumi-lo. Testável isolada quanto ao comportamento de config.
- **US3 (Phase 5)**: depende do nginx conf de US1 (T003) — é validação.
- **Polish (Phase 6)**: por último.

### User Story Dependencies

- **US1 (P1)** 🎯: MVP — container servindo o app.
- **US2 (P2)**: T007/T008/T009 são independentes do container (arquivos do app, [P]); a integração completa depende do entrypoint (T004).
- **US3 (P3)**: validação do fallback já implementado em T003.

### Parallel Opportunities

- US1: `T002` (.dockerignore) e `T003` (nginx template) em paralelo; T004/T005 dependem deles.
- US2: `T007`, `T008`, `T009` em paralelo (arquivos distintos do app).

---

## Parallel Example: User Story 2

```bash
T007 environment.ts (getter)  |  T008 index.html (<script env.js>)  |  T009 public/env.js (default)
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001 (baseline `ng build`).
2. US1 (T002–T006): `.dockerignore`, nginx template, entrypoint, Dockerfile + smoke test.
3. **VALIDAR**: `/` responde 200 e o app carrega. Já é publicável no Render.

### Entrega incremental

1. US1 → container servindo o app (MVP).
2. US2 → app aponta para o backend por `API_URL` + 2º serviço no `render.yaml`.
3. US3 → validação de deep links/refresh.
4. Polish → docs + mapa de aceitação (deploy real + CORS no backend).

---

## Notes

- [P] = arquivos diferentes, sem dependência mútua.
- Copiar do build a pasta **`dist/imperial-frontend/browser/`** (builder `application`/esbuild), não a raiz `dist/`.
- `envsubst` restrito a `${PORT}` para não estragar `$uri`/`$host` do nginx.
- Dependência cruzada: a URL pública do front precisa entrar em `Cors__AllowedOrigins` do backend (feature 023).
- Commit por task ou grupo lógico.
