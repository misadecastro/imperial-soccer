# Implementation Plan: Containerização do Frontend para Deploy no Render

**Branch**: `024-frontend-docker-render` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-frontend-docker-render/spec.md`

## Summary

Empacotar o frontend Angular 18 em uma imagem de container (Dockerfile multi-stage) publicável
no Render como Web Service (plano free), servindo os arquivos estáticos por um servidor web leve
(nginx) com **fallback SPA** (`try_files … /index.html`) e escutando na porta injetada pela
plataforma (`PORT`). O endereço da API passa a ser **configurável em runtime** por variável de
ambiente (`API_URL`) — espelhando o padrão da feature 023 (backend) e evitando rebuild ao trocar
de backend: o container gera um `env.js` com `window.__env.apiUrl` no startup, e o
`environment.ts` passa a ler esse valor (com fallback para `localhost` em dev).

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 18 (`src/frontend`, builder `@angular-devkit/build-angular:application` — esbuild)  
**Primary Dependencies**: já existentes (Angular CLI 18, Tailwind via build, Chart.js). Novo: imagens base Docker `node:20-alpine` (build) e `nginx:alpine` (runtime, com `envsubst`)  
**Storage**: N/A (frontend estático; sem estado no servidor)  
**Testing**: `docker build` + `docker run` local (smoke test: página carrega, `env.js` correto, deep link resolve) + verificação pós-deploy  
**Target Platform**: Render — Web Service baseado em container Linux (plano free); TLS na borda  
**Project Type**: Web (frontend containerizado; backend/feature 023 já implantado, fora de escopo)  
**Performance Goals**: N/A (entrega estática; assets versionados/cacheáveis)  
**Constraints**: servir na porta `PORT` (runtime); fallback SPA obrigatório; API URL configurável sem rebuild; imagem final sem toolchain de build (só nginx + assets)  
**Scale/Scope**: 1 Dockerfile, 1 `.dockerignore`, 1 template de nginx, 1 entrypoint, ajuste em `environment.ts` + `index.html`, `env.js` default; `render.yaml` estendido/novo serviço

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Simplicidade Funcional** — ✅ Servidor estático leve (nginx) + build multi-stage; runtime-config mínima (`window.__env`), sem framework de config pesado.
- [x] **II. Professor como Ator Central** — ✅ Sem mudança de fluxo; melhora a disponibilidade (app na nuvem).
- [x] **III. Aluno como Núcleo do Domínio** — ✅ Não toca domínio nem dados.
- [x] **IV. API-First com Frontend Desacoplado** — ✅ Reforça: frontend implantado em serviço próprio, apontando para a API por configuração; nenhuma lógica de negócio adicionada (só leitura de config).
- [x] **V. Persistência Orientada a Documentos** — ✅ N/A (frontend estático).
- [x] **Restrições de Arquitetura** — ✅ Angular CLI + build step (já é o modelo do projeto); Tailwind via build; sem CDN. `window.__env` é apenas configuração de ambiente, não estado global de negócio.

**Gate**: PASS — nenhum desvio. Feature de empacotamento/entrega do frontend.

## Project Structure

### Documentation (this feature)

```text
specs/024-frontend-docker-render/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões (nginx SPA, PORT, runtime API URL, dist/browser)
├── data-model.md        # Phase 1 — superfície de configuração (env vars do container)
├── quickstart.md        # Phase 1 — build local + deploy no Render + CORS no backend
├── contracts/
│   └── runtime-contract.md  # Contrato de runtime do container (entradas/porta/SPA/health)
└── tasks.md             # Phase 2 (/speckit.tasks — NÃO criado aqui)
```

### Source Code (repository root)

**Novos arquivos** (`src/frontend/`):

```text
src/frontend/
├── Dockerfile                  # NOVO — multi-stage: node:20-alpine (ng build) → nginx:alpine (serve browser/)
├── .dockerignore               # NOVO — ignora node_modules, dist, .angular, etc.
├── nginx.conf.template         # NOVO — server block com listen ${PORT} + try_files SPA
├── docker-entrypoint.sh        # NOVO — envsubst do PORT + gera env.js do API_URL + exec nginx
└── public/env.js               # NOVO — default de dev (window.__env com localhost)
```

**Arquivos editados** (`src/frontend/src/`):

```text
src/environments/environment.ts   # EDITAR — apiUrl lê window.__env?.apiUrl (fallback localhost)
index.html                        # EDITAR — <script src="env.js"></script> no <head>
```

**Infra (raiz)**:

```text
render.yaml                       # EDITAR — adicionar 2º serviço (web docker) para o frontend
```

**Structure Decision**: Dockerfile em `src/frontend/Dockerfile`, **contexto de build = `src/frontend/`**.
Estágio de build roda `npm ci` + `ng build` (saída em `dist/imperial-frontend/browser/`, por causa do
builder `application`). Estágio de runtime é `nginx:alpine` servindo esse `browser/`, com o
entrypoint gerando `env.js` e configurando a porta. No Render: novo Web Service, Root Directory
`src/frontend`, Dockerfile `Dockerfile` (relativo), plano free.

## Complexity Tracking

> Sem violações constitucionais — nenhuma entrada necessária.
