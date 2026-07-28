---
description: "Task list for feature 021-remove-evaluation"
---

# Tasks: Remoção da Avaliação de Alunos

**Input**: Design documents from `/specs/021-remove-evaluation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Nenhuma tarefa de teste automatizado — nem o spec nem o plano solicitaram TDD, e
não existem testes de avaliação no projeto. A validação é feita por gates de build
(`ng build` / `dotnet build`) + roteiro manual do `quickstart.md`.

**Organization**: Tarefas agrupadas por user story. **Atenção**: esta é uma feature
**subtrativa** sobre estado/tipos compartilhados. Por isso, ao contrário de features
aditivas, as stories têm ordem obrigatória (US1 → US2 → US3): o tipo compartilhado
`avaliacao.model.ts` e o campo `avaliacoes` do estado só podem ser removidos **depois** que
todos os consumidores (US1 e US2) forem limpos, senão o build TypeScript quebra.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência mútua)
- **[Story]**: US1, US2, US3

## Path Conventions

- Frontend: `src/frontend/src/app/...`
- Backend: `backend/Imperial.Api/...`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Garantir baseline verde antes de remover (a branch `021-remove-evaluation` já existe)

- [X] T001 Confirmar baseline verde antes da remoção: rodar `ng build` em `src/frontend` e `dotnet build backend/Imperial.slnx`; ambos devem passar sem erros

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: N/A para uma feature subtrativa — não há infraestrutura nova a criar.

Nenhuma tarefa foundational. A única regra de bloqueio transversal é de **ordem**: o arquivo
`avaliacao.model.ts` (T017) e o campo `avaliacoes` do `ImperialState` (T015) são os últimos a
sair, após US1 e US2 removerem seus imports/usos.

**Checkpoint**: Baseline verde confirmado → remoção pode começar por US1.

---

## Phase 3: User Story 1 - Remover o acesso à Avaliação de Alunos (Priority: P1) 🎯 MVP

**Goal**: Eliminar a tela de avaliação, a rota, o botão "Avaliar" e as notas Téc/Tát/Ment da
lista de alunos, de modo que não haja mais nenhum ponto de acesso à avaliação na navegação.

**Independent Test**: Autenticado, abrir **Alunos** (sem chips de notas, sem botão "Avaliar")
e acessar a URL antiga `/student-eval` (não exibe a tela; cai em página válida). Build verde
(o modelo `Avaliacao` ainda existe nesta fase, consumido apenas por dashboard/estado/backend).

### Implementation for User Story 1

- [X] T002 [P] [US1] Excluir o diretório da tela de avaliação `src/frontend/src/app/pages/student-eval/` (arquivos `student-eval.component.ts`, `.html`, `.css`)
- [X] T003 [US1] Editar `src/frontend/src/app/app.routes.ts` — remover o import de `StudentEvalComponent` e a rota `{ path: 'student-eval', ... }`; adicionar rota curinga `{ path: '**', redirectTo: '' }` ao final do array `routes` (cobre URLs antigas sem erro)
- [X] T004 [P] [US1] Editar `src/frontend/src/app/pages/students/students.component.ts` — remover import de `Avaliacao`, a interface `EvalChip`, os métodos `evalChips()`, `avaliar()` e `ultimaAvaliacao()`, e o import/injeção agora órfão de `Router`; ajustar o texto do `window.confirm` em `excluirAluno` para não mencionar "avaliações" (ex.: "Excluir este aluno?")
- [X] T005 [P] [US1] Editar `src/frontend/src/app/pages/students/students.component.html` — remover o bloco `*ngFor="let chip of evalChips(aluno)"` (chips de notas Téc/Tát/Ment) e o botão `(click)="avaliar(aluno.id)"` ("Avaliar")

**Checkpoint**: `ng build` verde; lista de alunos sem notas/"Avaliar"; `/student-eval` não acessível.

---

## Phase 4: User Story 2 - Remover a avaliação do painel/dashboard (Priority: P2)

**Goal**: Remover do dashboard o gráfico "Evolução Técnico-Tática-Mental" e o resumo de
avaliações recentes, preservando os demais indicadores (frequência, minutagem).

**Independent Test**: Abrir o **Dashboard** de um aluno — sem a seção de evolução
técnico-tática-mental; gráfico de minutagem e demais indicadores intactos. Build verde.

### Implementation for User Story 2

- [X] T006 [US2] Editar `src/frontend/src/app/pages/dashboard/dashboard.component.ts` — remover imports de `Avaliacao` e `EvolutionChartComponent`, remover `EvolutionChartComponent` do array `imports`, remover o campo `avaliacoesRecentes` da interface `AlunoData` e o cálculo/retorno de `avaliacoesRecentes` (manter Chart.js — usado pelo gráfico de minutagem)
- [X] T007 [US2] Editar `src/frontend/src/app/pages/dashboard/dashboard.component.html` — remover o bloco inteiro da seção "Evolução Técnico-Tática-Mental" (container + `<app-evolution-chart>`)
- [X] T008 [P] [US2] Excluir o diretório do gráfico `src/frontend/src/app/components/evolution-chart/` (arquivos `evolution-chart.component.ts`, `.html`, `.css`)

**Checkpoint**: `ng build` verde; dashboard sem seção de evolução; minutagem/frequência OK.

---

## Phase 5: User Story 3 - Remover os dados e o serviço de avaliação (Priority: P3)

**Goal**: Eliminar o endpoint/serviço, o modelo, o estado e a cascata de exclusão — nenhum
dado ou integração de avaliação permanece em uso ativo.

**Independent Test**: Swagger sem grupo `Evaluations` (`/evaluations` → 404); excluir um aluno
funciona sem etapa de avaliações; `ImperialState` sem `avaliacoes`. Build verde.

**⚠️ Depende de US1 e US2**: os consumidores de `Avaliacao`/`state.avaliacoes` precisam já ter
sido limpos antes de remover o modelo (T017) e o campo de estado (T015).

### Implementation for User Story 3 — Backend

- [X] T009 [P] [US3] Excluir `backend/Imperial.Api/Controllers/EvaluationsController.cs`
- [X] T010 [P] [US3] Excluir `backend/Imperial.Api/DTOs/EvaluationDtos.cs`
- [X] T011 [US3] Editar `backend/Imperial.Api/Controllers/StudentsController.cs` — remover o campo `_avaliacoes` (`IMongoCollection<Avaliacao>`), sua inicialização `database.GetCollection<Avaliacao>("evaluations")` e a chamada em cascata `_avaliacoes.DeleteManyAsync(...)` no método de exclusão de aluno (ajustar comentário/FR referente à cascata)
- [X] T012 [US3] Excluir `backend/Imperial.Api/Models/Avaliacao.cs` (após T011 remover a última referência no backend)

### Implementation for User Story 3 — Frontend estado/serviço

- [X] T013 [P] [US3] Excluir `src/frontend/src/app/services/evaluations.service.ts`
- [X] T014 [US3] Editar `src/frontend/src/app/services/students.service.ts` — remover a linha de cascata que filtra `stateService.state.avaliacoes` na exclusão de aluno e o comentário associado
- [X] T015 [US3] Editar `src/frontend/src/app/models/imperial-state.model.ts` — remover o import de `Avaliacao`, o campo `avaliacoes: Avaliacao[]` da interface `ImperialState` e a chave `avaliacoes: []` em `criarEstadoVazio()`
- [X] T016 [US3] Editar `src/frontend/src/app/services/state.service.ts` — remover a linha `avaliacoes: parsed.avaliacoes ?? []` da desserialização
- [X] T017 [US3] Excluir `src/frontend/src/app/models/avaliacao.model.ts` (**por último** — só após T004, T006, T014 e T015 removerem todos os imports)

**Checkpoint**: `ng build` + `dotnet build` verdes; `/evaluations` → 404; exclusão de aluno OK; `ImperialState` sem `avaliacoes`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Textos residuais, verificação de resíduos e validação final

- [X] T018 [P] Editar `src/frontend/src/app/pages/home/home.component.html` — revisar o texto que menciona "avaliações" (linha ~56) para não referenciar a funcionalidade removida
- [X] T019 [P] Editar `src/frontend/src/styles.css` — atualizar o comentário que menciona "avaliação" (linha ~33, ex.: "botões de presença")
- [X] T020 Verificar resíduos zero: `rg -i "avaliac|evaluation|evolution-chart|EvolutionChart" src/frontend/src/app` e `rg -i "avaliacao|evaluation" backend/Imperial.Api` devem retornar **nenhum** resultado em código de produção
- [X] T021 Rodar os gates de build finais: `ng build` (`src/frontend`) e `dotnet build backend/Imperial.slnx` — ambos verdes
- [ ] T022 Executar o roteiro de `quickstart.md` (fluxo funcional do professor + regressão de alunos/frequência/jogos/treinos/usuários/auth)
- [ ] T023 [P] (Opcional) Descartar dados órfãos no MongoDB: `db.evaluations.drop()`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências — começa imediatamente.
- **Foundational (Phase 2)**: sem tarefas.
- **User Stories (Phase 3–5)**: por serem subtrativas sobre estado/tipos compartilhados,
  seguem **ordem obrigatória** US1 → US2 → US3 (não são paralelas entre si).
- **Polish (Phase 6)**: após US1–US3.

### User Story Dependencies

- **US1 (P1)**: pode começar após o Setup. Não depende de outras stories.
- **US2 (P2)**: independente em teste, mas execute após US1 para manter o build sempre verde.
- **US3 (P3)**: **depende de US1 e US2** — remove o modelo `Avaliacao` (T017) e o campo de
  estado `avaliacoes` (T015), o que exige que todos os consumidores já tenham sido limpos.

### Within Each User Story

- US1: T002/T004/T005 são [P] (arquivos distintos); T003 edita `app.routes.ts` (independente).
- US2: T008 é [P]; T006 (dashboard.ts) antes/junto de T007 (dashboard.html); ambos antes de nada em US3.
- US3: T009/T010/T013 são [P] (deleções independentes); T011 antes de T012; T014/T015/T016 antes de T017.

### Parallel Opportunities

- US1: `T002`, `T004`, `T005` em paralelo (T003 pode ir junto — arquivo diferente).
- US3 backend: `T009`, `T010` em paralelo. US3 frontend: `T013` em paralelo às deleções backend.
- Polish: `T018`, `T019`, `T023` em paralelo.

---

## Parallel Example: User Story 1

```bash
# Deleções e edições em arquivos distintos podem ir juntas:
Task T002: Excluir pages/student-eval/
Task T004: Editar students.component.ts (remover Avaliacao/EvalChip/avaliar/ultimaAvaliacao/Router)
Task T005: Editar students.component.html (remover chips + botão Avaliar)
# T003 (app.routes.ts) também é arquivo distinto — pode ir em paralelo.
```

## Parallel Example: User Story 3 (deleções)

```bash
Task T009: Excluir EvaluationsController.cs
Task T010: Excluir DTOs/EvaluationDtos.cs
Task T013: Excluir services/evaluations.service.ts
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001 (baseline verde).
2. US1 (T002–T005) → build verde.
3. **VALIDAR**: lista de alunos sem avaliação; `/student-eval` inacessível. Já é um incremento entregável.

### Entrega incremental

1. US1 → valida acesso removido (MVP).
2. US2 → valida dashboard sem evolução.
3. US3 → valida backend/estado limpos e exclusão de aluno.
4. Polish → textos residuais + gates + quickstart.

### Observação sobre paralelismo entre stories

Diferentemente de features aditivas, **as stories não devem ser paralelizadas entre si** aqui:
compartilham o tipo `Avaliacao` e o estado `avaliacoes`, cuja remoção precisa ser a última
etapa. Paralelismo é seguro apenas **dentro** de cada story (arquivos distintos), como indicado.

---

## Notes

- [P] = arquivos diferentes, sem dependência mútua.
- Regra de ouro: **excluir** só arquivos exclusivos de avaliação; **editar** cirurgicamente os compartilhados.
- Commit após cada task ou grupo lógico; rodar `ng build`/`dotnet build` nos checkpoints.
- T017 (excluir `avaliacao.model.ts`) é sempre a última remoção do frontend.
