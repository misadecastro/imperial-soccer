---
description: "Task list for Configuração de Treino com Persistência Real"
---

# Tasks: Configuração de Treino com Persistência Real

**Input**: Design documents from `/specs/020-training-config-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/training-principles.md, contracts/game-moments.md, quickstart.md

**Tests**: Testes de backend (xUnit) incluídos apenas para a lógica de maior risco (validação de unicidade e cascata RI-1/RI-2), conforme research Decisão 8. Sem testes de frontend (o projeto não possui suíte Angular).

**Organization**: Tarefas agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: US1, US2, US3
- Caminhos de arquivo absolutos a partir da raiz do repositório

## Path Conventions

- Backend: `backend/Imperial.Api/` (+ testes em `backend/Imperial.Api.Tests/`)
- Frontend: `src/frontend/src/app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar que a base existente compila antes de estender

- [X] T001 Verificar build da solução backend com `cd backend && dotnet build Imperial.slnx` e do frontend com `cd src/frontend && ng build`, garantindo baseline verde antes das alterações (nenhuma dependência nova é necessária — `MongoDB.Driver`, JWT e `HttpClient` já presentes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelos de domínio, DTOs, seed e base do serviço Angular — pré-requisitos de todas as user stories

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase

- [X] T002 [P] Criar modelo `backend/Imperial.Api/Models/ItemTrabalhado.cs` (`Id` string default `Guid.NewGuid().ToString()`, `Label` string) conforme data-model.md
- [X] T003 [P] Criar modelo `backend/Imperial.Api/Models/PrincipioGrupo.cs` (`Id`, `Titulo`, `Filtro` string default `"sempre"`, `Itens: List<ItemTrabalhado>`) conforme data-model.md
- [X] T004 [P] Criar modelo `backend/Imperial.Api/Models/VinculoMomentoPrincipio.cs` (`GrupoId` string, `ItemIds: List<string>`) conforme data-model.md
- [X] T005 [P] Criar modelo `backend/Imperial.Api/Models/Momento.cs` (`Id`, `Label`, `Desc` default vazio, `Tipo` string default `"ofensivo"`, `Vinculos: List<VinculoMomentoPrincipio>`) conforme data-model.md
- [X] T006 Criar `backend/Imperial.Api/DTOs/TrainingConfigDtos.cs` com os records de request/response: `CreatePrincipioRequest(Titulo, Filtro?)`, `UpdatePrincipioRequest(Titulo, Filtro?)`, `ItemRequest(Label)`, `CreateMomentoRequest(Label, Desc?, Tipo?)`, `UpdateMomentoRequest(Label, Desc?)`, `SetVinculosRequest(List<VinculoDto> Vinculos)`, `VinculoDto(GrupoId, ItemIds)` — respostas reutilizam os modelos `PrincipioGrupo`/`Momento` (serialização camelCase padrão)
- [X] T007 Criar `backend/Imperial.Api/Services/TrainingConfigSeedService.cs` (`Scoped`) que semeia idempotentemente `training_principles` (3 grupos com itens) e `game_moments` (4 momentos, vínculos vazios) — inserção condicionada a cada coleção estar vazia, ids-slug preservados (data-model.md seção Seed)
- [X] T008 Registrar e executar o seed em `backend/Imperial.Api/Program.cs`: `AddScoped<TrainingConfigSeedService>()` e chamada `SeedAsync()` no escopo de startup (ao lado do `AdminSeedService` existente)
- [X] T009 Refatorar a base de `src/frontend/src/app/services/training-config.service.ts`: injetar `HttpClient`, converter `_grupos`/`_momentos` em cache privado inicialmente vazio, manter os getters `grupos`/`momentos`, remover os seeds locais (`seedGrupos`/`seedMomentos`) e adicionar `carregar(): Observable<void>` que faz os dois GETs (`/training-principles`, `/game-moments`) e popula o cache (padrão de `evaluations.service.ts`)

**Checkpoint**: Backend compila com modelos+seed; GET popula dados; serviço Angular carrega config do backend (métodos de mutação ainda a implementar nas stories)

---

## Phase 3: User Story 1 - Princípios/Fundamentos e Itens com Persistência Real (Priority: P1) 🎯 MVP

**Goal**: Admin cria/edita/remove Princípios/Fundamentos e seus Itens Trabalhados, persistindo no backend; professor lê

**Independent Test**: Criar princípio com 2 itens, recarregar/reabrir navegador e confirmar persistência; validar nome vazio/duplicado; remover grupo e ver cascata nos vínculos

### Implementation for User Story 1

- [X] T010 [US1] Criar `backend/Imperial.Api/Controllers/TrainingPrinciplesController.cs` (`[Route("api/v1/training-principles")]`, `[Authorize]` na classe): `GET` (lista todos), `POST` grupo, `PUT /{id}` grupo, `DELETE /{id}` grupo — POST/PUT/DELETE com `[Authorize(Roles = Roles.Administrador)]`; acesso via `IMongoCollection<PrincipioGrupo>("training_principles")`; respostas em `ApiResponse<T>`
- [X] T011 [US1] Adicionar ao `TrainingPrinciplesController` os sub-recursos de item: `POST /{id}/items`, `PUT /{id}/items/{itemId}`, `DELETE /{id}/items/{itemId}` (todos `Administrador`), retornando o `PrincipioGrupo` atualizado
- [X] T012 [US1] Implementar validações no controller (RI-3/RI-4): título de grupo e label de item não vazios (trim) e únicos case-insensitive no escopo, retornando `400` com `errors[]` em pt-BR (padrão `EvaluationsController`)
- [X] T013 [US1] Implementar a cascata no `DELETE` do grupo (RI-1: `UpdateMany` em `game_moments` removendo vínculos com `grupoId == id`) e no `DELETE` de item (RI-2: remover `itemId` dos `itemIds` de vínculos daquele grupo em todos os momentos)
- [X] T014 [P] [US1] Adicionar métodos de Princípios/Itens em `src/frontend/src/app/services/training-config.service.ts` retornando `Observable`, chamando os endpoints e atualizando o cache no `tap`: `criarGrupo`, `renomearGrupo`, `removerGrupo`, `adicionarItem`, `renomearItem`, `removerItem` (removendo as versões síncronas em memória)
- [X] T015 [US1] Adaptar a aba "Princípios e Fundamentos" em `src/frontend/src/app/pages/training-config/training-config.component.ts`/`.html`: chamar `config.carregar()` no `ngOnInit`; converter o helper `run()` para assinar `Observable` (sucesso/erro → toast), tratando erro do backend via `ApiResponse.message`

**Checkpoint**: US1 funcional ponta-a-ponta — CRUD de princípios/itens persiste; validação e cascata no servidor; professor consegue ler

---

## Phase 4: User Story 2 - Momentos do Jogo e Vínculos com Persistência Real (Priority: P1)

**Goal**: Admin cria/edita/remove Momentos (nome+descrição) e vincula/desvincula Princípios com seleção de itens, persistindo no backend

**Independent Test**: Criar momento com descrição, vincular 2 princípios e marcar itens, recarregar e confirmar tudo; desvincular e confirmar remoção; validar nome vazio/duplicado

### Implementation for User Story 2

- [X] T016 [US2] Criar `backend/Imperial.Api/Controllers/GameMomentsController.cs` (`[Route("api/v1/game-moments")]`, `[Authorize]` na classe): `GET` (lista todos), `POST` momento, `PUT /{id}` (label+desc), `DELETE /{id}` — POST/PUT/DELETE com `[Authorize(Roles = Roles.Administrador)]`; via `IMongoCollection<Momento>("game_moments")`; respostas em `ApiResponse<T>`
- [X] T017 [US2] Adicionar validações de momento no controller (RI-3/RI-4): `label` não vazio (trim) e único case-insensitive entre momentos → `400` com `errors[]`
- [X] T018 [US2] Implementar `PUT /{id}/vinculos` (`Administrador`) que substitui em bloco os vínculos e aplica RI-5: descartar vínculos cujo `grupoId` não existe em `training_principles` e `itemIds` que não pertencem ao grupo (equivalente a `definirVinculos` da feature 019), retornando o `Momento` saneado
- [X] T019 [P] [US2] Adicionar métodos de Momentos/Vínculos em `src/frontend/src/app/services/training-config.service.ts` retornando `Observable` e atualizando o cache: `criarMomento`, `renomearMomento` (label+desc), `removerMomento`, `definirVinculos` (→ `PUT /{id}/vinculos`) — removendo as versões síncronas
- [X] T020 [US2] Adaptar a aba "Momentos do Jogo" (fluxo lista/form) em `src/frontend/src/app/pages/training-config/training-config.component.ts`/`.html`: `salvarMomento` assíncrono (criar → depois definir vínculos; ou renomear+definir vínculos na edição), `removerMomento` assíncrono, mantendo o rascunho `formVinculos` e o feedback via toast

**Checkpoint**: US1 + US2 completos — configuração inteira persiste e é editável pelo admin

---

## Phase 5: User Story 3 - Consumir a Configuração Real na Montagem de Treino (Priority: P2)

**Goal**: Professor/Admin monta treino usando Momentos e Princípios/Itens carregados do backend, não os dados fixos

**Independent Test**: Admin adiciona novo princípio/momento pelo backend; professor abre a montagem de treino e vê os novos itens disponíveis

### Implementation for User Story 3

- [X] T021 [US3] Ajustar `src/frontend/src/app/pages/training/training.component.ts`: chamar `trainingConfig.carregar()` no `ngOnInit` (assinando), garantindo que os getters `momentos`/`principiosGrupos` reflitam os dados do backend em vez do mock removido; tratar estado de carregamento inicial (listas vazias até a resposta)
- [X] T022 [US3] Verificar/ajustar `src/frontend/src/app/pages/training/training.component.html` para lidar com a config inicialmente vazia durante o carregamento (sem quebrar a montagem antes da resposta do backend)

**Checkpoint**: Todas as user stories funcionais; montagem de treino consome dados reais

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Testes de risco, validação de build e roteiro manual

- [X] T023 [P] Criar testes xUnit em `backend/Imperial.Api.Tests/Controllers/TrainingPrinciplesTests.cs` cobrindo unicidade/nome vazio (RI-3/RI-4) e cascata RI-1/RI-2 (remoção de grupo/item limpando vínculos em `game_moments`), no padrão dos testes existentes (MongoDB real, banco dedicado limpo)
- [X] T024 [P] Criar testes xUnit em `backend/Imperial.Api.Tests/Controllers/GameMomentsTests.cs` cobrindo validação de nome de momento e saneamento de vínculos do `PUT /vinculos` (RI-5)
- [X] T025 [P] Criar teste xUnit em `backend/Imperial.Api.Tests/Services/TrainingConfigSeedServiceTests.cs` validando seed idempotente (não duplica em segunda execução) das duas coleções
- [X] T026 Rodar `cd backend && dotnet build Imperial.slnx && dotnet test Imperial.slnx` e `cd src/frontend && ng build`, corrigindo erros de tipo/compilação (tsconfig `strict: true`)
- [ ] T027 Executar o roteiro de validação manual de `specs/020-training-config-api/quickstart.md` (29 cenários: seed, CRUD, validação, cascata, gate de papel, consumo na montagem)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup — **BLOQUEIA** todas as user stories (modelos, DTOs, seed, base do serviço Angular)
- **User Stories (Phase 3–5)**: dependem do Foundational
  - US1 (P1) e US2 (P1) são independentes entre si no backend (controllers separados), mas **compartilham** `training-config.service.ts` e `training-config.component` no frontend → coordenar edições (US1 antes de US2 recomendado)
  - US3 (P2) depende de `carregar()` (T009) e é mais valiosa após US1/US2 terem dados persistidos, mas é testável isolada
- **Polish (Phase 6)**: depende das user stories implementadas

### User Story Dependencies

- **US1 (P1)**: após Foundational — entrega CRUD de princípios/itens (MVP)
- **US2 (P1)**: após Foundational — CRUD de momentos/vínculos; independente de US1 no backend
- **US3 (P2)**: após Foundational (T009); consome o que US1/US2 persistem

### Within Each User Story

- Backend controller antes dos métodos de serviço Angular que o consomem
- Métodos de serviço antes da adaptação do componente
- No frontend, T014/T019 tocam o mesmo arquivo de serviço → sequenciais entre si (mas [P] em relação ao backend da mesma story)

### Parallel Opportunities

- Foundational: T002–T005 (modelos, arquivos distintos) em paralelo; T006 depois
- Backend vs. Frontend da mesma story podem andar em paralelo até o ponto de integração (ex.: T010–T013 backend enquanto T014 monta as chamadas do serviço)
- Polish: T023/T024/T025 (arquivos de teste distintos) em paralelo

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (build baseline)
2. Phase 2: Foundational (modelos + seed + base do serviço)
3. Phase 3: US1 (princípios/itens ponta-a-ponta)
4. **PARAR e VALIDAR**: persistência, validação e cascata de princípios/itens
5. Demo do MVP

### Incremental Delivery

1. Setup + Foundational → base pronta (seed popula o banco)
2. US1 → testar → demo (CRUD de princípios/itens persistente)
3. US2 → testar → demo (momentos + vínculos persistentes)
4. US3 → testar → demo (montagem de treino consumindo backend)
5. Polish → testes de risco + build + quickstart

---

## Notes

- Feature **backend real (.NET/MongoDB) + integração Angular** — encerra o serviço mock em memória da feature 019 como fonte da verdade
- Leitura autenticada (professor); escrita admin-only (`[Authorize(Roles = Roles.Administrador)]`)
- US1 e US2 editam `training-config.service.ts` e `training-config.component` → evitar conflitos de edição
- Envelope `ApiResponse<T>` e endpoints sob `/api/v1/` obrigatórios (Princípio IV)
- Commit após cada task ou grupo lógico; parar em qualquer checkpoint para validar a story isolada
