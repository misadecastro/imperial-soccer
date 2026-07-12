# Tasks: Avaliações com Persistência Real

**Input**: Design documents from `/specs/018-evaluation-api/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Sem suíte automatizada — validação manual via curl e browser, conforme `quickstart.md`.

**Organization**: O `StudentEvalComponent` contém todas as operações CRUD de avaliações (listar, criar, editar, excluir) em um único arquivo. Todas as user story tasks editam esse mesmo arquivo — executar sequencialmente. US1 e US2 são P1 (listar primeiro pois é a base observacional do registro).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar tipos compartilhados entre as 4 user stories (backend models/DTOs + frontend model types).

- [x] T001 [P] Criar modelo `Avaliacao` em `backend/Imperial.Api/Models/Avaliacao.cs` com campos: `Id` (string GUID), `AlunoId` (string), `Data` (string), `Tatico` (int), `Tecnico` (int), `Mental` (int) — conforme `data-model.md`
- [x] T002 [P] Criar DTOs em `backend/Imperial.Api/DTOs/EvaluationDtos.cs`: records `CreateEvaluationRequest(string AlunoId, string Data, int Tatico, int Tecnico, int Mental)`, `UpdateEvaluationRequest(string Data, int Tatico, int Tecnico, int Mental)` e `EvaluationResponse(string Id, string AlunoId, string Data, int Tatico, int Tecnico, int Mental)` — conforme `contracts/evaluations-api.md`
- [x] T003 [P] Adicionar interfaces `CreateEvaluationRequest` e `UpdateEvaluationRequest` em `src/frontend/src/app/models/avaliacao.model.ts` (existente) — mantendo a interface `Avaliacao` inalterada

**Checkpoint**: Sem erros de compilação em backend e frontend após as adições.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend controller completo + extensão da cascata + Angular service. Base para todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story pode ser implementada até esta fase estar completa.

- [x] T004 Implementar `EvaluationsController` em `backend/Imperial.Api/Controllers/EvaluationsController.cs` com os 4 endpoints abaixo, todos com `[Authorize]` e respostas no envelope padrão `ApiResponse<T>` (depende de T001, T002):
  - `GET /api/v1/evaluations?alunoId=xxx` → busca avaliações da coleção `evaluations` filtradas por `AlunoId`, retorna lista (vazia se nenhuma)
  - `POST /api/v1/evaluations` → valida `CreateEvaluationRequest` (todos obrigatórios, data não futura, notas em {2,3,4,5}), insere e retorna 201
  - `PUT /api/v1/evaluations/{id}` → busca por Id, valida `UpdateEvaluationRequest`, atualiza e retorna 200 ou 404
  - `DELETE /api/v1/evaluations/{id}` → busca por Id, deleta e retorna 200 ou 404

- [x] T005 Estender `StudentsController.Delete` em `backend/Imperial.Api/Controllers/StudentsController.cs` para injetar `IMongoCollection<Avaliacao>` e excluir em cascata todas as avaliações cujo `AlunoId` == aluno excluído, antes de retornar 200 — implementa FR-013 sem mudar contrato externo do endpoint

- [x] T006 Implementar `EvaluationsService` em `src/frontend/src/app/services/evaluations.service.ts` com os 4 métodos (depende de T003):
  - `listarPorAluno(alunoId)`: GET → substitui `stateService.state.avaliacoes` pelo resultado filtrado
  - `criar(request)`: POST → adiciona a nova avaliação a `stateService.state.avaliacoes`
  - `atualizar(id, request)`: PUT → atualiza o item correspondente em `stateService.state.avaliacoes`
  - `excluir(id)`: DELETE → remove o item de `stateService.state.avaliacoes`
  - Nenhum dos 4 métodos chama `stateService.save()` (avaliações não são mais persistidas em sessionStorage)

**Checkpoint**: `dotnet build` compila sem erros; `ng build` compila sem erros; `GET /api/v1/evaluations?alunoId=qualquer` retorna `[]` via curl com token válido.

---

## Phase 3: User Story 2 - Visualizar Histórico de Avaliações do Backend (Priority: P1) 🎯 MVP parcial

**Goal**: A tela de avaliação de um aluno carrega o histórico do backend; sem dados fictícios automáticos.

**Independent Test**: Acessar `/student-eval?alunoId=<id>` de um aluno sem avaliações → "Nenhuma avaliação registrada ainda" (sem mock). Com avaliações no backend → histórico carregado e paginado; gráfico de evolução exibido.

- [x] T007 [US2] Atualizar `StudentEvalComponent` em `src/frontend/src/app/pages/student-eval/student-eval.component.ts`:
  - Injetar `EvaluationsService` no construtor (ou como dependência Angular)
  - Substituir o getter `todasAvaliacoes` (que lê `stateService.state.avaliacoes`) por chamada a `evaluationsService.listarPorAluno(this.alunoId)` no `ngOnInit()` (após resolver o `alunoId` do query param)
  - O campo `todasAvaliacoes: Avaliacao[]` deve ser populado pelo serviço e continuar servindo paginação, ordenação e gráfico como antes
  - **Remover** ou neutralizar qualquer lógica que dependia de avaliações em `sessionStorage` sendo pré-populadas com mock data
- [x] T008 [US2] Validado via curl: GET com lista vazia → `[]` sem mock; POST avaliacao → 201; GET após → avaliacao carregada; paginação e gráfico continuam usando `todasAvaliacoes` (campo estável)

**Checkpoint**: Lista carregada do backend; sem mock data; paginação e gráfico com dados reais.

---

## Phase 4: User Story 1 - Registrar Nova Avaliação com Persistência Real (Priority: P1)

**Goal**: O formulário "Nova Avaliação" persiste no backend; dados sobrevivem entre sessões.

**Independent Test**: Registrar avaliação pelo formulário Angular, fechar o navegador, reabrir, logar → avaliação ainda no histórico.

- [x] T009 [US1] Atualizar `StudentEvalComponent.submitNovaAvaliacao()` em `src/frontend/src/app/pages/student-eval/student-eval.component.ts` para chamar `evaluationsService.criar({alunoId, data, tatico, tecnico, mental})` em vez de fazer push direto em `stateService.state.avaliacoes`, tratando erros do backend com mensagem adequada
- [x] T010 [US1] Validado via curl: POST avaliacao → 201 + id MongoDB; GET → avaliacao presente; POST nota inválida → 400 com mensagem customizada

**Checkpoint**: Registro via formulário persiste no MongoDB; persistência entre sessões confirmada.

---

## Phase 5: User Story 3 - Editar Avaliação Existente com Persistência Real (Priority: P2)

**Goal**: A edição inline de avaliações persiste no backend.

**Independent Test**: Editar uma avaliação pelo formulário inline, recarregar a página → versão editada no histórico.

- [x] T011 [US3] Atualizar `StudentEvalComponent.salvarEdicao(id)` em `src/frontend/src/app/pages/student-eval/student-eval.component.ts` para chamar `evaluationsService.atualizar(id, {data, tatico, tecnico, mental})` em vez de atualizar diretamente o índice de `stateService.state.avaliacoes`, tratando erros com mensagem adequada
- [x] T012 [US3] Validado via curl: PUT avaliacao → 200 + valores atualizados; GET após → novos valores presentes

**Checkpoint**: Edição via formulário inline persiste no MongoDB.

---

## Phase 6: User Story 4 - Excluir Avaliação com Persistência Real (Priority: P2)

**Goal**: A exclusão de avaliações persiste no backend; cascata de exclusão de aluno também funciona.

**Independent Test**: Excluir avaliação pelo botão "Excluir", recarregar → não retorna. Excluir aluno com avaliações em `/students` → avaliações do aluno removidas do backend.

- [x] T013 [US4] Atualizar `StudentEvalComponent.excluirAvaliacao(id)` em `src/frontend/src/app/pages/student-eval/student-eval.component.ts` para chamar `evaluationsService.excluir(id)` em vez de filtrar diretamente `stateService.state.avaliacoes`, tratando erros com mensagem adequada
- [x] T014 [US4] Validado via curl: DELETE avaliacao → 200; GET após → `[]`; cascata na exclusão do aluno confirmada via extensão do `StudentsController.Delete` (T005)

**Checkpoint**: Exclusão persiste no backend; cascata de aluno funciona.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T015 [P] `dotnet build` ✓ (0 erros, 0 warnings); `ng build` ✓ (699 kB, dentro do orçamento de 750 kB)
- [x] T016 [P] Validados via curl: lista vazia, POST 201, GET lista, PUT 200, nota inválida 400, DELETE 200, GET vazio após delete — todos os 7 cenários passaram
- [x] T017 Confirmado por código: `DashboardComponent.computeAlunoData()` lê `state.avaliacoes` → `EvaluationsService.listarPorAluno()` popula esse cache → fluxo funciona quando o professor visita a avaliação do aluno antes de abrir o dashboard

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001/T002/T003 em paralelo — sem dependências.
- **Foundational (Phase 2)**: T004 depende de T001+T002; T005 depende de T001 (modelo Avaliacao); T006 depende de T003. T004/T005/T006 são paralelos entre si (arquivos distintos).
- **US2 (Phase 3)**: Depende de T004+T006 — controller e service prontos.
- **US1 (Phase 4)**: Depende de US2 — mesmo arquivo (`student-eval.component.ts`); T009 se apoia em T007.
- **US3 (Phase 5)**: Depende de US1 — mesmo arquivo; T011 se apoia em T009.
- **US4 (Phase 6)**: Depende de US3 — mesmo arquivo; T013 se apoia em T011.
- **Polish**: Depende de todas as user stories concluídas.

### Paralelismo

```
# Phase 1 — tudo em paralelo:
T001 (Avaliacao.cs)  ||  T002 (EvaluationDtos.cs)  ||  T003 (avaliacao.model.ts)

# Phase 2 — paralelo entre backend e frontend:
T004 (EvaluationsController)  ||  T005 (StudentsController cascade)  ||  T006 (EvaluationsService)

# Phases 3–6 — sequenciais (mesmo arquivo: student-eval.component.ts):
T007 → T009 → T011 → T013
```

---

## Implementation Strategy

### MVP (US2 + US1 = listagem real + registro persistente)

1. Setup (T001–T003) + Foundational (T004–T006)
2. US2 (T007–T008) → histórico carregado do backend, sem mock
3. US1 (T009–T010) → registro persistente
4. **PARAR E VALIDAR**: histórico real e cadastro persistente funcionam
5. MVP entregue — CRUD completo segue incrementalmente

### Notas de implementação

- `EvaluationsController` segue exatamente o padrão de `StudentsController` (feature 017): `IMongoDatabase` no construtor, `ApiResponse<T>` nas respostas, `[Authorize]`.
- `EvaluationsService` segue o padrão de `StudentsService` (feature 017): popula `stateService.state.avaliacoes` como cache, sem chamar `stateService.save()`.
- No `StudentEvalComponent`, o campo `todasAvaliacoes: Avaliacao[]` era um **getter** que lia de `stateService.state.avaliacoes` — precisará ser convertido em **campo** populado pelo `EvaluationsService.listarPorAluno()`, consistente com a correção de performance da feature 015 (mesma razão: getter criava nova referência a cada ciclo de change detection).
- A lista de notas válidas no backend: `static readonly int[] NotasValidas = [2, 3, 4, 5]`.
- O `alunoId` em `StudentEvalComponent` já vem do URL query param (route snapshot) — inalterado.
