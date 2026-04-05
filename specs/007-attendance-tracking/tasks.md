# Tasks: Chamada de Treino

**Input**: Design documents from `/specs/007-attendance-tracking/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação por inspeção visual manual e fluxo funcional (ver quickstart.md).

**Organization**: Tarefas agrupadas por user story para implementação incremental e testável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependências)
- **[Story]**: User story correspondente da spec.md

## Path Conventions

```text
src/frontend/
├── index.html
├── css/
│   └── imperial.css          ← sem alteração
└── pages/
    ├── login.html             ← sem alteração
    ├── students.html          ← adicionar menu de navegação
    ├── student-eval.html     ← adicionar menu de navegação
    └── training.html          ← NOVA
```

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Criar o arquivo `training.html` com estrutura base e garantir que o estado `chamadas` seja inicializado corretamente.

- [x] T001 Criar `src/frontend/pages/training.html` com estrutura HTML base: `<!DOCTYPE html>`, `<head>` com Tailwind CDN + link para `../css/imperial.css` + mesmo `tailwind.config` das outras páginas (tokens do redesign 006), `<body class="bg-imperial-bg text-imperial-text min-h-screen flex flex-col pb-32">`, header verde idêntico às demais páginas, placeholder `<main>` e `<footer>` vazio
- [x] T002 Adicionar função `loadState()` / `saveState()` em `training.html` que lê/escreve `"imperialState"` de `sessionStorage`, inicializando `chamadas: []` se ausente — padrão idêntico ao `students.html`
- [x] T003 Adicionar constantes `CATEGORIAS`, `CATEGORIAS_LABELS`, `AVATAR_COLORS` e helper `getInitials()` em `training.html` — copiar exatamente de `students.html` para consistência

---

## Phase 2: Foundational (Lógica de Chamada)

**Purpose**: Implementar as funções de domínio para criar, buscar, atualizar e salvar chamadas — bloqueia todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode ser implementada sem estas funções.

- [x] T004 Implementar função `findChamada(data, categoria)` em `training.html` — busca em `state.chamadas` pela combinação `data + categoria`; retorna o objeto chamada ou `null`
- [x] T005 Implementar função `criarChamada(data, categoria)` em `training.html` — filtra `state.alunos` pela categoria, gera array de `registros` com `{ alunoId, status: "pendente" }` para cada aluno, cria objeto chamada com UUID, retorna o objeto sem salvar ainda
- [x] T006 Implementar função `getOrCreateChamada(data, categoria)` em `training.html` — chama `findChamada`; se existir, retorna a chamada salva; se não, chama `criarChamada` e retorna a nova (sem salvar — save ocorre ao clicar "Salvar")
- [x] T007 Implementar função `setStatus(chamada, alunoId, status)` em `training.html` — encontra o registro pelo `alunoId` dentro de `chamada.registros` e atualiza o `status`; atualiza os contadores na UI chamando `atualizarContadores(chamada)`
- [x] T008 Implementar função `atualizarContadores(chamada)` em `training.html` — conta registros por status e atualiza os elementos DOM `#contPresentes`, `#contFaltas`, `#contPendentes`
- [x] T009 Implementar função `salvarChamada(chamada)` em `training.html` — verifica se já existe chamada com mesma data+categoria em `state.chamadas`; se sim, substitui; se não, adiciona; chama `saveState()`; exibe toast de confirmação

**Checkpoint**: Lógica de domínio completa — user stories podem iniciar.

---

## Phase 3: User Story 1 — Registrar Chamada Completa (Priority: P1) 🎯 MVP

**Goal**: O professor seleciona data e categoria, vê a lista de alunos com botões Presente/Falta, e salva a chamada.

**Independent Test**: Selecionar data de hoje + Sub 09, marcar 3 alunos como Presente, 1 como Falta, clicar "Salvar" → toast de sucesso aparece e dados persistem ao reabrir a mesma data/categoria.

### Implementation for User Story 1

- [x] T010 [US1] Criar campo de data em `src/frontend/pages/training.html` — `<input type="date" id="inputData">` com `max` = hoje (ISO), classe `px-4 py-2 rounded-lg bg-imperial-bg border border-imperial-border text-imperial-text focus:ring-2 focus:ring-imperial-green w-full sm:w-64`; label "Data do Treino"; seção com fundo `bg-imperial-card rounded-xl shadow-sm border border-imperial-border px-4 py-4 mx-4 mt-4`
- [x] T011 [US1] Criar abas de categoria em `src/frontend/pages/training.html` — container `<div id="abas" class="flex overflow-x-auto scrollbar-none gap-2 px-4 py-3 bg-imperial-card border-b border-imperial-border">` com um `<button class="tab-btn shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border border-imperial-border bg-imperial-bg text-imperial-text-muted">` para cada categoria; ao clicar, adicionar classe `.tab-active` (definida em `imperial.css`) e remover das demais; disparar `renderChamada()`
- [x] T012 [US1] Criar painel de resumo em `src/frontend/pages/training.html` — `<div id="painelResumo" class="hidden mx-4 mt-3 bg-imperial-card rounded-xl shadow-sm border border-imperial-border px-4 py-3 flex items-center justify-between">` com título `<span id="tituloCategoria">` mostrando "Sub XX — N alunos" e três contadores: `<div>` cada um com número `<span id="contPresentes" class="text-2xl font-bold text-imperial-green-mid">` e label `<span class="text-xs text-imperial-text-muted">`
- [x] T013 [US1] Criar lista de alunos em `src/frontend/pages/training.html` — `<div id="listaAlunos" class="mx-4 mt-3 space-y-2">` preenchida por `renderLista(chamada)` que itera `chamada.registros`, busca o aluno em `state.alunos`, e gera para cada um: cartão `bg-imperial-card rounded-xl shadow-sm border border-imperial-border px-4 py-3 flex items-center gap-3` com avatar circular (classe `.avatar` de `imperial.css`, cor `AVATAR_COLORS[index % 8]`, iniciais do nome), nome do aluno, e dois botões "Presente" / "Falta"
- [x] T014 [US1] Estilizar botões Presente/Falta em `src/frontend/pages/training.html` — estado pendente: `px-3 py-1.5 rounded-lg text-xs font-medium border border-imperial-border text-imperial-text-muted bg-imperial-card btn-attendance`; estado presente ativo: `border-imperial-green-mid bg-imperial-green-light text-imperial-green-mid`; estado falta ativo: `border-imperial-red bg-imperial-red-light text-imperial-red`; ao clicar, chamar `setStatus(chamada, alunoId, status)` e re-renderizar o cartão
- [x] T015 [US1] Criar botão "Salvar Presença" em `src/frontend/pages/training.html` — `<div class="fixed bottom-16 left-0 right-0 px-4 py-3 bg-imperial-bg border-t border-imperial-border">` com `<button id="btnSalvar" class="w-full py-3 rounded-xl bg-imperial-green text-white font-semibold text-base shadow-lg hover:opacity-90">Salvar Presença</button>`; ao clicar, chamar `salvarChamada(chamadaAtual)` (o objeto em memória)
- [x] T016 [US1] Implementar função `renderChamada()` em `src/frontend/pages/training.html` — lê `inputData.value` e categoria ativa; se data vazia, exibir aviso "Selecione a data do treino"; se categoria não selecionada, ocultar lista; caso contrário, chamar `getOrCreateChamada(data, categoria)`, atribuir a `chamadaAtual`, mostrar `painelResumo`, chamar `atualizarContadores()` e `renderLista()`
- [x] T017 [US1] Adicionar listener `change` em `#inputData` e listener `click` nas abas para acionar `renderChamada()` em `src/frontend/pages/training.html`; adicionar toast `<div id="toast">` idêntico ao das outras páginas; implementar `showToast(msg, type)`

**Checkpoint**: Abrir `training.html`, selecionar data + Sub 09, marcar alunos, salvar → fluxo completo funcional. US1 entregável como MVP.

---

## Phase 4: User Story 2 — Marcar Todos de Uma Vez (Priority: P2)

**Goal**: Botões "Todos Presentes" e "Todos Ausentes" marcam toda a turma de uma só vez.

**Independent Test**: Clicar "Todos Presentes" com 6 alunos visíveis → todos ficam verdes, contador mostra 6 Presentes, 0 Faltas, 0 Pendentes.

### Implementation for User Story 2

- [x] T018 [US2] Adicionar controles "Todos Presentes" / "Todos Ausentes" em `src/frontend/pages/training.html` — container `<div id="controlesGlobais" class="hidden mx-4 mt-2 flex gap-2">` com dois botões: "Todos Presentes" (`flex-1 py-2 rounded-lg text-sm font-medium border border-imperial-green-mid text-imperial-green-mid hover:bg-imperial-green-light btn-attendance`) e "Todos Ausentes" (`flex-1 py-2 rounded-lg text-sm font-medium border border-imperial-red text-imperial-red hover:bg-imperial-red-light btn-attendance`); mostrar/ocultar junto com `painelResumo`
- [x] T019 [US2] Implementar handler "Todos Presentes" em `src/frontend/pages/training.html` — itera todos os `registros` de `chamadaAtual`, chama `setStatus` com `"presente"` para cada um, depois chama `renderLista(chamadaAtual)` e `atualizarContadores(chamadaAtual)`
- [x] T020 [US2] Implementar handler "Todos Ausentes" em `src/frontend/pages/training.html` — mesmo que T019, mas com status `"falta"`

**Checkpoint**: Controles de marcação em massa funcionais e contadores corretos após uso.

---

## Phase 5: User Story 3 — Menu de Navegação (Priority: P2)

**Goal**: Menu fixo "Alunos / Treino" visível em `students.html`, `student-eval.html` e `training.html`, com item ativo destacado.

**Independent Test**: Estando em `students.html`, clicar em "Treino" → navega para `training.html` sem recarregar dados desnecessariamente.

### Implementation for User Story 3

- [x] T021 [US3] Criar componente HTML do menu de navegação para inserção em `src/frontend/pages/students.html` — adicionar antes do `</body>`: `<nav class="fixed bottom-0 left-0 right-0 bg-imperial-card border-t border-imperial-border flex h-16 z-40">` com dois botões: "Alunos" (link para `students.html`, ícone de pessoa, label "Alunos") e "Treino" (link para `training.html`, ícone de calendário, label "Treino"); item "Alunos" com `text-imperial-green font-semibold` (ativo), item "Treino" com `text-imperial-text-muted`; adicionar `pb-16` ao `<body>` para compensar o nav fixo
- [x] T022 [P] [US3] Adicionar o mesmo menu de navegação em `src/frontend/pages/student-eval.html` — item "Alunos" ativo (verde), item "Treino" inativo (muted); adicionar `pb-16` ao `<body>`
- [x] T023 [P] [US3] Adicionar menu de navegação em `src/frontend/pages/training.html` — item "Treino" ativo (verde), item "Alunos" inativo (muted); `<body>` já tem `pb-32` para acomodar nav (64px) + botão salvar (64px)

**Checkpoint**: Menu visível e funcional em todas as 3 páginas com destaque correto do item ativo.

---

## Phase 6: User Story 4 — Histórico de Chamadas (Priority: P3)

**Goal**: Ao selecionar uma categoria, o professor pode ver o histórico de chamadas registradas listadas abaixo da chamada ativa.

**Independent Test**: Após salvar 2 chamadas para Sub 09 em datas diferentes, trocar de categoria e voltar para Sub 09 → as 2 chamadas salvas aparecem no histórico com data e contagem Presentes/Faltas.

### Implementation for User Story 4

- [x] T024 [US4] Criar seção de histórico em `src/frontend/pages/training.html` — `<section id="secaoHistorico" class="hidden mx-4 mt-4 mb-2">` com título `<h2 class="text-sm font-semibold text-imperial-text-muted mb-2 uppercase tracking-wide">Chamadas Anteriores</h2>` e container `<div id="listaHistorico" class="space-y-2">`
- [x] T025 [US4] Implementar função `renderHistorico(categoria)` em `src/frontend/pages/training.html` — filtra `state.chamadas` pela categoria, ordena por data decrescente, exclui a chamada da data atual; para cada chamada, gera card `bg-imperial-card rounded-xl shadow-sm border border-imperial-border px-4 py-3 flex justify-between items-center` com data formatada e badges "N Presentes" (verde) e "N Faltas" (vermelho); se lista vazia, mostrar mensagem "Nenhuma chamada anterior registrada"
- [x] T026 [US4] Integrar `renderHistorico(categoria)` dentro de `renderChamada()` em `src/frontend/pages/training.html` — chamar após `renderLista()`; mostrar/ocultar `secaoHistorico` conforme existência de dados

**Checkpoint**: Histórico de chamadas exibido corretamente ao selecionar uma categoria.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Validações, mensagens de erro, responsividade e fluxo completo.

- [x] T027 Validar data futura em `src/frontend/pages/training.html` — no listener `change` de `#inputData`, se a data selecionada for maior que hoje, exibir mensagem de erro inline abaixo do campo e limpar `chamadaAtual`; bloquear renderização da lista
- [x] T028 [P] Exibir mensagem amigável quando categoria não tem alunos em `src/frontend/pages/training.html` — em `renderLista()`, se `chamadaAtual.registros.length === 0`, exibir `<div class="py-10 text-center text-imperial-text-muted text-sm">Nenhum aluno cadastrado nesta categoria.</div>` e ocultar `controlesGlobais` e `btnSalvar`
- [x] T029 [P] Validar fluxo completo conforme `specs/007-attendance-tracking/quickstart.md` — abrir `students.html`, navegar para `training.html` via menu, registrar chamada, salvar, voltar e retornar → confirmar persistência e zero regressões nas páginas existentes
- [x] T030 Verificar responsividade de `src/frontend/pages/training.html` em 320 px e 375 px no DevTools — confirmar: abas roláveis sem overflow, cartões de aluno legíveis, botão salvar acessível acima do menu, menu de navegação não cobre conteúdo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente (T001–T003)
- **Foundational (Phase 2)**: Depende de T001–T003 — bloqueia US1 e todas as demais
- **US1 (Phase 3)**: Depende de Foundational — MVP entregável ao concluir
- **US2 (Phase 4)**: Depende de US1 (precisa de `chamadaAtual` e `renderLista`)
- **US3 (Phase 5)**: Independente de US1/US2 — pode ser feita em paralelo após Foundational; T022 e T023 são paralelas entre si
- **US4 (Phase 6)**: Depende de US1 (precisa de `state.chamadas` populado)
- **Polish (Phase 7)**: Depende de todas as user stories

### User Story Dependencies

- **US1 (P1)**: Única dependência de Foundational — sem dependências de outras stories
- **US2 (P2)**: Depende de US1 (mesmo arquivo, mesma `chamadaAtual`)
- **US3 (P2)**: Independente — arquivos distintos (`students.html`, `student-eval.html`, `training.html`)
- **US4 (P3)**: Depende de US1 (`state.chamadas` precisa ter dados para testar)

### Within Each User Story

- Estrutura HTML antes de handlers JS
- Renderização antes de interatividade
- Lógica de domínio antes de UI

### Parallel Opportunities

- T001, T002, T003 podem iniciar imediatamente (arquivo novo, sem dependências externas)
- T021, T022, T023 podem rodar em paralelo (arquivos distintos)
- T028 e T029 podem rodar em paralelo
- T004–T009 são sequenciais (cada função usa a anterior)

---

## Parallel Example: User Story 3

```text
# Podem rodar ao mesmo tempo após T001 (training.html criado):
T021 — Menu em students.html
T022 — Menu em student-eval.html
T023 — Menu em training.html
```

---

## Implementation Strategy

### MVP First (User Story 1 Apenas)

1. Concluir Phase 1: Setup (T001–T003)
2. Concluir Phase 2: Foundational (T004–T009)
3. Concluir Phase 3: US1 (T010–T017)
4. **PARAR e VALIDAR**: Registrar chamada completa (data + categoria → marcar → salvar) ✓
5. MVP entregável: professor já consegue registrar presenças

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → chamada funcional → **Demo MVP**
3. US2 → marcação em massa → **Demo produtividade**
4. US3 → menu de navegação → **Demo UX completa**
5. US4 + Polish → histórico e validações → **Entrega completa**

---

## Notes

- [P] = arquivos distintos, sem dependência entre tarefas marcadas
- Nenhuma lógica JS das páginas existentes deve ser alterada (apenas menu adicionado)
- O `tailwind.config` em `training.html` deve ser idêntico ao das outras páginas (tokens da feature 006)
- O padrão de `loadState`/`saveState` e `showToast` deve ser copiado literalmente de `students.html`
- Em caso de dúvida sobre o visual esperado, consultar `Novo-Design/Pagina-Exemplo.png` e `specs/007-attendance-tracking/research.md`
- Commitar após cada phase concluída
