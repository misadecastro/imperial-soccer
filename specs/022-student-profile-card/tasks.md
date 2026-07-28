---
description: "Task list for feature 022-student-profile-card"
---

# Tasks: Ficha do Aluno com Avaliações Dinâmicas

**Input**: Design documents from `/specs/022-student-profile-card/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Sem tarefas de teste automatizado obrigatórias (não solicitado TDD). Validação por
gates de build (`dotnet build` / `ng build`) + `quickstart.md`. Uma tarefa opcional de testes de
integração backend fica no Polish.

**Organization**: Tarefas agrupadas por user story (P1 → P2 → P3). US1 é o MVP. US3 depende de
US1 (ficha) e US2 (existir tipos). Reaproveita o padrão da feature 020 (tipos dinâmicos) e o
Chart.js do dashboard (radar/linha).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência mútua)
- **[Story]**: US1, US2, US3

## Path Conventions

- Backend: `backend/Imperial.Api/...`
- Frontend: `src/frontend/src/app/...`

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirmar baseline verde: `dotnet build backend/Imperial.slnx` e `ng build` em `src/frontend`
- [X] T002 Garantir base de dados limpa para o novo esquema: se existir a coleção `evaluations` do esquema antigo (features 018/021), descartá-la (`db.evaluations.drop()`) antes de usar o novo esquema (ver research.md Decisão 6)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Nenhuma infraestrutura nova bloqueante — a feature reaproveita autenticação,
`authGuard` (com `data.papel`), envelope de resposta e Chart.js já existentes.

Sem tarefas foundational. Ordem entre stories: US1 e US2 podem ser feitas em paralelo; US3
requer US1 (ficha) e US2 (tipos) prontas.

**Checkpoint**: Baseline verde → US1/US2 podem começar.

---

## Phase 3: User Story 1 - Acessar e visualizar a ficha do aluno (Priority: P1) 🎯 MVP

**Goal**: Botão "Ficha" na lista de alunos abre a página (3 colunas → 1 no celular) com o quadro
"Aluno" (dados + idade calculada + edição inline) e o quadro "Avaliação Geral" (texto livre),
tudo persistido.

**Independent Test**: Abrir a ficha de um aluno, editar dados do atleta e enviar foto, preencher
a Avaliação Geral, recarregar e confirmar persistência; reduzir para largura de celular e ver 1
coluna.

### Implementation for User Story 1

- [X] T003 [P] [US1] Backend: estender `backend/Imperial.Api/Models/Aluno.cs` com `Foto` (string?), `PeDominante` (string?), `MassaCorporal` (decimal?), `Estatura` (decimal?), `AvaliacaoGeral` (string?)
- [X] T004 [P] [US1] Backend: em `backend/Imperial.Api/DTOs/StudentDtos.cs`, criar `UpdateStudentProfileRequest` e estender o `StudentResponse` com os campos da ficha
- [X] T005 [US1] Backend: em `backend/Imperial.Api/Controllers/StudentsController.cs`, adicionar `PUT /students/{id}/profile` (valida pé dominante ∈ Direito/Esquerdo/Ambidestro, massa/estatura > 0, foto como data URI; campos opcionais) e incluir os novos campos no `Map`/`GET`
- [X] T006 [P] [US1] Frontend: estender `src/frontend/src/app/models/aluno.model.ts` com `peDominante`, `massaCorporal`, `estatura`, `foto`, `avaliacaoGeral` e um `UpdateStudentProfileRequest`
- [X] T007 [US1] Frontend: em `src/frontend/src/app/services/students.service.ts`, adicionar `atualizarFicha(id, dados)` (chama `PUT /students/{id}/profile` e atualiza o cache `state.alunos`)
- [X] T008 [US1] Frontend: em `src/frontend/src/app/app.routes.ts`, adicionar rota `student-profile` (com `authGuard`)
- [X] T009 [US1] Frontend: em `src/frontend/src/app/pages/students/students.component.ts` e `.html`, adicionar o botão "Ficha" que navega para `/student-profile?alunoId=<id>`
- [X] T010 [US1] Frontend: criar a página `src/frontend/src/app/pages/student-profile/` (component .ts/.html/.css) com layout de 3 colunas que colapsa para 1 em telas de celular; carrega o aluno por `alunoId`
- [X] T011 [P] [US1] Frontend: criar `src/frontend/src/app/components/student-info-card/` — quadro "Aluno" com foto (upload + compressão/redimensionamento no cliente + placeholder), campos, edição inline e **idade calculada** a partir da data de nascimento
- [X] T012 [P] [US1] Frontend: criar `src/frontend/src/app/components/general-evaluation/` — quadro "Avaliação Geral" (textarea longa + salvar)
- [X] T013 [US1] Frontend: integrar `student-info-card` e `general-evaluation` na 1ª coluna da ficha, ligados ao `atualizarFicha` (persistência)

**Checkpoint**: `ng build` + `dotnet build` verdes; ficha abre, edita, persiste e é responsiva.

---

## Phase 4: User Story 2 - Gerenciar tipos de avaliação (administrador) (Priority: P2)

**Goal**: Administrador acessa (engrenagem) a gestão de tipos: lista com nome + editar/excluir,
filtro por nome, "Novo" (nome + itens). Exclusão é soft delete. Tipos ativos viram quadros nas
fichas.

**Independent Test**: Como admin, criar/editar/filtrar/excluir tipos e ver a lista refletir cada
operação; confirmar que a rota é negada a não-admin.

### Implementation for User Story 2

- [X] T014 [P] [US2] Backend: criar `backend/Imperial.Api/Models/EvaluationItem.cs` (`Id`, `Nome`)
- [X] T015 [P] [US2] Backend: criar `backend/Imperial.Api/Models/EvaluationType.cs` (`Id`, `Nome`, `Itens: List<EvaluationItem>`, `Arquivado: bool`) — raiz de `evaluation_types`
- [X] T016 [P] [US2] Backend: criar `backend/Imperial.Api/DTOs/EvaluationDtos.cs` com `CreateEvaluationTypeRequest`, `UpdateEvaluationTypeRequest` (item com `id?` + `nome`) e responses
- [X] T017 [US2] Backend: criar `backend/Imperial.Api/Controllers/EvaluationTypesController.cs` — `GET` (só `Arquivado=false`, autenticado), `POST`/`PUT`/`DELETE` (`[Authorize(Roles = Roles.Administrador)]`); DELETE = soft delete (`Arquivado=true`); reconciliação de itens por `id`; validar nome obrigatório/único entre ativos e ≥1 item
- [X] T018 [P] [US2] Frontend: criar `src/frontend/src/app/models/evaluation-type.model.ts` (`EvaluationType`, `EvaluationItem`)
- [X] T019 [US2] Frontend: criar `src/frontend/src/app/services/evaluation-types.service.ts` — cache em memória + `carregar/criar/atualizar/arquivar` (padrão `training-config.service.ts`)
- [X] T020 [US2] Frontend: em `src/frontend/src/app/app.routes.ts`, adicionar rota `evaluation-types` (`authGuard` + `data: { papel: 'Administrador' }`)
- [X] T021 [US2] Frontend: criar a página `src/frontend/src/app/pages/evaluation-types/` — lista (nome + editar/excluir), campo de filtro por nome, botão "Novo" e formulário (nome + adicionar/remover itens)
- [X] T022 [US2] Frontend: em `src/frontend/src/app/pages/student-profile/`, adicionar o botão de engrenagem no topo (visível apenas a Administrador) que navega para `/evaluation-types`

**Checkpoint**: `ng build` + `dotnet build` verdes; CRUD de tipos com soft delete; rota negada a não-admin.

---

## Phase 5: User Story 3 - Avaliar o aluno e visualizar evolução por tipo (Priority: P3)

**Goal**: Quadros por tipo nas colunas 2/3: sem avaliação → botão "Avaliar" (prancheta); com
avaliação → radar + "Avaliar" no canto sup. dir. (ícone + tooltip). Tela de avaliar: data +
notas 1–5, gráfico de evolução por item e histórico.

**Independent Test**: Em uma ficha com ≥1 tipo, avaliar (data + notas), salvar, ver o quadro
virar radar e o "Avaliar" migrar para o canto; reabrir a tela e ver evolução por item + histórico.

**⚠️ Depende de US1 (ficha) e US2 (tipos).**

### Implementation for User Story 3

- [X] T023 [P] [US3] Backend: criar `backend/Imperial.Api/Models/Evaluation.cs` (`Id`, `AlunoId`, `TipoId`, `Data`, `Pontuacoes: List<{ ItemId, Nota }>`) — coleção `evaluations`
- [X] T024 [P] [US3] Backend: adicionar em `backend/Imperial.Api/DTOs/EvaluationDtos.cs` o `CreateEvaluationRequest` e o `EvaluationResponse`
- [X] T025 [US3] Backend: criar `backend/Imperial.Api/Controllers/EvaluationsController.cs` — `POST` criar (valida `nota` inteiro 1–5, tipo existente/ativo, `itemId` válidos do tipo) e `GET /evaluations?alunoId=&tipoId=` (histórico ordenado); autenticado
- [X] T026 [P] [US3] Frontend: criar `src/frontend/src/app/models/evaluation.model.ts` (`Evaluation`, `Pontuacao`, `CreateEvaluationRequest`)
- [X] T027 [US3] Frontend: criar `src/frontend/src/app/services/evaluations.service.ts` — `criar(...)` e `listarPorAluno(alunoId, tipoId?)`
- [X] T028 [P] [US3] Frontend: criar `src/frontend/src/app/components/radar-chart/` — gráfico de radar reutilizável (Chart.js `chart.js/auto`), com fallback legível quando o tipo tem < 3 itens
- [X] T029 [US3] Frontend: criar `src/frontend/src/app/components/evaluation-type-panel/` — quadro por tipo: título com o nome; **sem** avaliação → botão "Avaliar" com ícone de prancheta; **com** avaliação → radar (avaliação mais recente) + "Avaliar" no canto superior direito (só ícone + tooltip "Avaliar")
- [X] T030 [US3] Frontend: em `src/frontend/src/app/pages/student-profile/`, carregar tipos ativos + avaliações do aluno e renderizar os `evaluation-type-panel` distribuídos entre as colunas 2 e 3
- [X] T031 [US3] Frontend: em `src/frontend/src/app/app.routes.ts`, adicionar rota `student-evaluation` (`authGuard`)
- [X] T032 [US3] Frontend: criar a página `src/frontend/src/app/pages/student-evaluation/` — form com data + cada item pontuável de 1 a 5, salvar; abaixo, gráfico de **evolução por item** (linha) e **histórico** de avaliações
- [X] T033 [US3] Frontend: ligar o "Avaliar" do painel para navegar a `/student-evaluation?alunoId=&tipoId=` e, ao voltar, atualizar o quadro (radar/estado)

**Checkpoint**: `ng build` + `dotnet build` verdes; fluxo de avaliação completo com radar, evolução e histórico.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T034 [P] Validar responsividade da ficha (3 → 1 coluna) sem rolagem horizontal em largura de celular
- [ ] T035 [P] (Opcional) Testes de integração backend (xUnit) em `backend/Imperial.Api.Tests/Controllers/` para `EvaluationTypes` (soft delete, papel), `Evaluations` (nota 1–5, tipo ativo) e `PUT /students/{id}/profile`
- [X] T036 Rodar gates finais: `ng build` (`src/frontend`) e `dotnet build backend/Imperial.slnx` — ambos verdes
- [ ] T037 Executar o roteiro de `quickstart.md` (US1/US2/US3 + verificações de API/Swagger)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: sem tarefas.
- **US1 (Phase 3)** e **US2 (Phase 4)**: podem ser feitas em paralelo (áreas de código distintas).
- **US3 (Phase 5)**: depende de US1 (ficha existir) e US2 (tipos existirem).
- **Polish (Phase 6)**: após as stories desejadas.

### User Story Dependencies

- **US1 (P1)** 🎯: independente — é o MVP.
- **US2 (P2)**: independente para sua própria página/CRUD; o ponto de entrada (engrenagem, T022)
  vive na ficha (US1), mas o gerenciamento é testável isolado pela rota `/evaluation-types`.
- **US3 (P3)**: requer US1 + US2.

### Within Each User Story

- Backend model → DTO → controller; frontend model → service → página/componentes.
- US1: T003/T004/T006/T011/T012 são [P]; T005 depende de T003/T004; T013 integra T010–T012.
- US2: T014/T015/T016/T018 são [P]; T017 depende de T014–T016; T021 depende de T019; T022 depende da ficha (T010).
- US3: T023/T024/T026/T028 são [P]; T025 depende de T023/T024; T029 depende de T028; T030 depende de T027/T029; T032/T033 dependem de T027/T031.

### Parallel Opportunities

- US1 e US2 por desenvolvedores diferentes após o Setup.
- Dentro de cada story, os modelos/DTOs/componentes marcados [P] (arquivos distintos) em paralelo.

---

## Parallel Example: User Story 1

```bash
# Modelos/DTOs/componentes em arquivos distintos:
T003 Aluno.cs (backend)      | T004 StudentDtos.cs (backend)
T006 aluno.model.ts (front)  | T011 student-info-card/ | T012 general-evaluation/
```

## Parallel Example: User Story 3

```bash
T023 Evaluation.cs | T024 EvaluationDtos.cs (append) | T026 evaluation.model.ts | T028 radar-chart/
```

---

## Implementation Strategy

### MVP (User Story 1)

1. T001–T002 (setup).
2. US1 (T003–T013) → ficha com dados do atleta + avaliação geral, responsiva e persistente.
3. **VALIDAR** e entregar — já é útil ao professor sem os tipos dinâmicos.

### Entrega incremental

1. US1 → ficha (MVP).
2. US2 → gestão de tipos (admin) + engrenagem na ficha.
3. US3 → quadros por tipo, avaliar, radar, evolução e histórico.
4. Polish → responsividade, (opcional) testes de integração, gates e quickstart.

---

## Notes

- [P] = arquivos diferentes, sem dependência mútua.
- Reaproveitar padrões: `TrainingPrinciplesController`/`TrainingConfigService` (tipos dinâmicos) e
  o uso de Chart.js do dashboard (radar/linha).
- Foto: comprimir/redimensionar no cliente antes do upload (research.md Decisão 5).
- Exclusão de tipo é **soft delete** — nunca apagar registros de avaliação.
- Commit por task ou grupo lógico; rodar os builds nos checkpoints.
