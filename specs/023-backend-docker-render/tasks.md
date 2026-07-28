---
description: "Task list for feature 023-backend-docker-render"
---

# Tasks: Containerização do Backend para Deploy no Render

**Input**: Design documents from `/specs/023-backend-docker-render/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Sem tarefas de teste automatizado (feature de infra; TDD não solicitado). Validação
por smoke test local (`docker build`/`docker run` + `curl /health`) e pelo mapa de aceitação do
`quickstart.md`.

**Organization**: Tarefas agrupadas por user story (P1 → P2 → P3). US1 = imagem que roda no
Render (MVP). US2 = configuração por variáveis (banco + CORS). US3 = segredos fora do repo/imagem.

> Nota de ordem: `backend/Imperial.Api/Program.cs` é editado em US1 (PORT, health, HTTPS) e US2
> (CORS) — como é o mesmo arquivo, essas edições são **sequenciais** (US1 antes de US2).
> Passos de deploy no Render e provisionamento do MongoDB são **operacionais** (painel/CLI do
> provedor), não automatizáveis a partir do repositório.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência mútua)
- **[Story]**: US1, US2, US3

## Path Conventions

- Backend: `backend/Imperial.Api/...`; Dockerfile/.dockerignore em `backend/`; `render.yaml` na raiz.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirmar baseline verde: `dotnet build backend/Imperial.slnx` (garante que a app compila antes de containerizar)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Nenhuma infraestrutura nova bloqueante. A app já existe e roda; esta feature apenas
a empacota e parametriza. Sem tarefas foundational.

**Checkpoint**: Baseline verde → US1 pode começar.

---

## Phase 3: User Story 1 - Publicar o backend como container no Render (Priority: P1) 🎯 MVP

**Goal**: Imagem de container construível a partir do repositório que sobe no Render, escuta na
porta injetada pela plataforma e responde por HTTPS (health check em `/health`).

**Independent Test**: `docker build` + `docker run` local com as variáveis obrigatórias e
`curl http://localhost:8080/health` → `200 {"status":"ok"}`; no Render, a URL pública responde.

### Implementation for User Story 1

- [X] T002 [US1] Em `backend/Imperial.Api/Program.cs`, ler `PORT` do ambiente e vincular o Kestrel a `http://0.0.0.0:{PORT}` (fallback `8080`) via `builder.WebHost.UseUrls(...)` (research Decisão 2 / FR-002)
- [X] T003 [US1] Em `backend/Imperial.Api/Program.cs`, chamar `app.UseHttpsRedirection()` **somente** quando `app.Environment.IsDevelopment()` (TLS terminado na borda do Render — research Decisão 3)
- [X] T004 [US1] Em `backend/Imperial.Api/Program.cs`, adicionar endpoint anônimo `app.MapGet("/health", () => Results.Ok(new { status = "ok" }))` (research Decisão 6 / contrato de runtime)
- [X] T005 [P] [US1] Criar `backend/.dockerignore` ignorando `**/bin`, `**/obj`, `.git`, `**/appsettings.*.json` (overrides locais), `*.user`, `**/.vs` (reduz contexto e evita vazar artefatos — research Decisão 7)
- [X] T006 [US1] Criar `backend/Dockerfile` multi-stage: estágio `mcr.microsoft.com/dotnet/sdk:8.0` (copiar `Imperial.Api/*.csproj`, `dotnet restore`, copiar `Imperial.Api/`, `dotnet publish -c Release -o /app`) → estágio `mcr.microsoft.com/dotnet/aspnet:8.0` (copiar `/app`, `ENTRYPOINT ["dotnet","Imperial.Api.dll"]`); publica **só** `Imperial.Api` (não o projeto de testes) — research Decisão 1
- [X] T007 [US1] Smoke test local: `docker build -t imperial-api -f backend/Dockerfile backend` e `docker run` com `PORT`, `MongoDb__ConnectionString`, `Cors__AllowedOrigins__0`, `Jwt__Key`, `AdminSeed__Email`, `AdminSeed__Senha`; validar `curl /health` → 200 (requer Docker + MongoDB acessível)

**Checkpoint**: Imagem builda, sobe na porta de `PORT` e responde em `/health`.

---

## Phase 4: User Story 2 - Configurar banco e CORS por variáveis de ambiente (Priority: P2)

**Goal**: String de conexão do banco e origem(ns) de CORS do frontend vêm de variáveis de
ambiente; uma variável de CORS aceita uma ou várias origens; trocar valores não exige rebuild.

**Independent Test**: Definir `MongoDb__ConnectionString` e `Cors__AllowedOrigins__0` (com uma ou
mais origens); reiniciar; a API usa o banco indicado e só a(s) origem(ns) configurada(s) passa(m)
no CORS.

### Implementation for User Story 2

- [X] T008 [US2] Em `backend/Imperial.Api/Program.cs`, ao montar a política de CORS, **achatar** `Cors:AllowedOrigins` dividindo cada entrada por `,`/`;`, `Trim()` e remover barra final/vazios (uma variável cobre uma ou várias origens — research Decisão 4 / FR-005)
- [X] T009 [US2] Criar `render.yaml` na raiz: Web Service `env: docker`, `dockerfilePath: backend/Dockerfile`, `dockerContext: backend`, `healthCheckPath: /health`, e `envVars` listando os **nomes** (ver data-model.md) com `sync: false` para os segredos (research Decisão 7 / FR-004, FR-005, FR-008)
- [X] T010 [US2] Documentar o mapeamento de variáveis (convenção `__`) na seção de deploy do `CLAUDE.md` (backend), apontando para `specs/023-backend-docker-render/quickstart.md`

**Checkpoint**: Banco e CORS controlados por variáveis; mudança de valor vale sem rebuild.

---

## Phase 5: User Story 3 - Manter segredos fora do repositório e da imagem (Priority: P3)

**Goal**: Nenhum segredo real no repositório nem embutido na imagem; startup falha claro quando
falta config obrigatória.

**Independent Test**: Inspecionar repo e imagem (sem connection string/chave/senha); subir o
container sem `Jwt__Key` e confirmar que ele **não sobe** com erro claro.

**⚠️ Depende de US1 (imagem/.dockerignore) e US2 (render.yaml).**

### Implementation for User Story 3

- [X] T011 [US3] Verificar o repositório: `rg -i "mongodb\+srv://|Jwt.*Key|AdminSeed"` e revisar `backend/Imperial.Api/appsettings.json` — confirmar que **não há** string de conexão real, chave de token nem senha (appsettings deve manter só defaults não-secretos) — FR-009/SC-004
- [X] T012 [US3] Verificar a imagem: `docker history imperial-api` e `docker run --rm imperial-api sh -c "ls /app/appsettings*.json"` — confirmar que nenhum `appsettings.*.json` local com segredo nem outro segredo foi embutido (o `.dockerignore` de T005 cobre os overrides locais)
- [X] T013 [US3] Verificar a segurança de startup: `docker run` **sem** `Jwt__Key` → o processo encerra com mensagem clara (comportamento existente do `throw` em `Program.cs`) — FR-010/SC-006

**Checkpoint**: Zero segredos no repo/imagem; startup seguro validado.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T014 [P] Revisar `specs/023-backend-docker-render/quickstart.md` e garantir que os nomes das variáveis e os passos batem com o `render.yaml` e o `Dockerfile` finais
- [ ] T015 Executar o mapa de aceitação do `quickstart.md` (7 verificações: /health, CORS ok/bloqueado, troca de variável sem rebuild, ausência de segredos, falha sem Jwt__Key, seed do Admin no 1º deploy)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: sem tarefas.
- **US1 (Phase 3)**: base — a imagem precisa existir e rodar.
- **US2 (Phase 4)**: edita o mesmo `Program.cs` (CORS) → após as edições de Program.cs em US1; o `render.yaml` referencia o Dockerfile de US1.
- **US3 (Phase 5)**: verificação/hardening dos artefatos de US1/US2 → após ambas.
- **Polish (Phase 6)**: por último.

### User Story Dependencies

- **US1 (P1)** 🎯: MVP — imagem containerizada rodando.
- **US2 (P2)**: depende de US1 (Dockerfile existir; Program.cs já editado). Testável isolada quanto ao comportamento de config.
- **US3 (P3)**: depende de US1 + US2 (verifica repo, imagem e render.yaml).

### Within Each User Story

- US1: T002→T003→T004 são sequenciais (mesmo `Program.cs`); T005 é [P] (arquivo distinto); T006 depende de T005 estar presente para um build limpo; T007 depende de T002–T006.
- US2: T008 (Program.cs) sequencial após US1; T009/T010 são [P] entre si (arquivos distintos).
- US3: T011/T012/T013 são verificações independentes (podem ser [P] em execução manual).

### Parallel Opportunities

- US1: `T005` (.dockerignore) em paralelo às edições de `Program.cs`.
- US2: `T009` (render.yaml) e `T010` (docs) em paralelo.
- US3: as três verificações em paralelo.

---

## Parallel Example: User Story 1

```bash
# Arquivos distintos podem ir juntos:
T005 backend/.dockerignore   |  (T002/T003/T004 editam Program.cs — sequenciais entre si)
T006 backend/Dockerfile
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001 (baseline).
2. US1 (T002–T007): ajustes no `Program.cs` + Dockerfile + `.dockerignore` + smoke test local.
3. **VALIDAR**: imagem sobe e responde `/health`. Já é publicável no Render.

### Entrega incremental

1. US1 → imagem containerizada (MVP; já dá para deployar).
2. US2 → banco e CORS por variáveis + `render.yaml` (blueprint) + docs.
3. US3 → verificação de segredos e segurança de startup.
4. Polish → conferência dos docs e execução do mapa de aceitação (deploy real).

---

## Notes

- [P] = arquivos diferentes, sem dependência mútua.
- `Program.cs` é o único arquivo de código tocado (4 ajustes pequenos: PORT, HTTPS guard, /health, CORS split).
- Deploy no Render e provisionamento/allowlist do MongoDB externo são passos **operacionais**
  (painel do Render / provedor do banco), documentados no `quickstart.md`.
- Segredos nunca no repo/imagem: `.dockerignore` + `render.yaml` (`sync:false`) + `appsettings.json` sem segredos.
- Commit por task ou grupo lógico.
