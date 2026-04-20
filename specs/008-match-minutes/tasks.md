# Tasks: Minutagem de Jogos

**Input**: Design documents from `/specs/008-match-minutes/`
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
    ├── students.html          ← adicionar 3º item ao menu
    ├── student-eval.html      ← adicionar 3º item ao menu
    ├── training.html          ← adicionar 3º item ao menu
    └── games.html             ← NOVA
```

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Criar `games.html` com estrutura base e garantir que o estado `jogos` seja inicializado corretamente.

- [ ] T001 Criar `src/frontend/pages/games.html` com estrutura HTML base: `<!DOCTYPE html>`, `<head>` com Tailwind CDN + `<link>` para `../css/imperial.css` + bloco `<script>tailwind.config={...}</script>` idêntico ao de `students.html` (mesmos tokens de cor `imperial`), `<body class="bg-imperial-bg text-imperial-text min-h-screen flex flex-col pb-16">`, header verde com logo SVG + título "Imperial Soccer" + subtítulo "Jogos", div `id="toast"` oculto, `<main class="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">` vazia e `<script type="module">` vazio
- [ ] T002 Adicionar funções `loadState()` e `saveState()` em `src/frontend/pages/games.html` — `loadState()` lê `sessionStorage["imperialState"]`, inicializa `jogos: []` se o campo ausente no JSON existente (sem sobrescrever demais dados), retorna objeto; `saveState()` persiste `JSON.stringify(state)`; chamar `const state = loadState()` após as funções
- [ ] T003 Adicionar em `src/frontend/pages/games.html` as constantes `CATEGORIAS`, `CATEGORIAS_LABELS`, `AVATAR_COLORS` e os helpers `generateId()` (`crypto.randomUUID()`), `getInitials(nome)`, `escapeHtml(str)`, `formatDate(isoDate)` (`DD/MM/YYYY`), `showToast(msg, type)` — copiar literalmente de `src/frontend/pages/students.html` para consistência

---

## Phase 2: Foundational (Lógica de Domínio)

**Purpose**: Implementar as funções de domínio para criar, atualizar e excluir jogos — bloqueia todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode ser implementada sem estas funções.

- [ ] T004 Implementar função `findJogo(id)` em `src/frontend/pages/games.html` — `return state.jogos.find(j => j.id === id)`
- [ ] T005 Implementar função `saveJogo(dados, id)` em `src/frontend/pages/games.html` — se `id` fornecido, encontra o jogo pelo id e faz `Object.assign(jogo, dados)`; se `id` ausente/nulo, faz `state.jogos.push({ id: generateId(), ...dados })`; chama `saveState()` após a operação
- [ ] T006 Implementar função `deleteJogo(id)` em `src/frontend/pages/games.html` — `state.jogos = state.jogos.filter(j => j.id !== id)`; chama `saveState()`
- [ ] T007 Declarar variáveis de estado da UI em `src/frontend/pages/games.html`: `let jogoEditando = null` (null = modo criação, objeto Jogo = modo edição) e `let participacoesAtual = []` (array de `{alunoId, minutos}` do formulário em edição)

**Checkpoint**: Lógica de domínio completa — user stories podem iniciar.

---

## Phase 3: User Story 1 — Cadastrar Novo Jogo com Minutagem (Priority: P1) 🎯 MVP

**Goal**: O professor preenche data e nome, adiciona alunos com filtro, registra minutagem e salva o jogo.

**Independent Test**: Criar jogo "vs. América" com data 2026-04-20, selecionar 3 alunos de categorias diferentes, preencher minutagens 45/90/0, salvar → toast de sucesso + jogo aparece na lista com "3 alunos".

### Implementation for User Story 1

- [ ] T008 [US1] Criar seção de formulário em `src/frontend/pages/games.html` — `<section id="secaoFormJogo" class="hidden">` contendo: `<h2>` com título dinâmico ("Novo Jogo" ou "Editar Jogo"), `<form id="formJogo" novalidate>` com campo `<input type="date" id="inputDataJogo">` (label "Data de Realização \*", classes `w-full sm:w-64 px-4 py-2.5 rounded-lg bg-imperial-bg border border-imperial-border text-imperial-text focus:ring-2 focus:ring-imperial-green`), campo `<input type="text" id="inputNomeJogo" placeholder="Ex.: vs. América">` (label "Nome do Jogo \*", mesmas classes), `<p id="erroDataJogo" class="hidden text-xs text-imperial-red">`, `<p id="erroNomeJogo" class="hidden text-xs text-imperial-red">`, div `<div id="listaParticipacoes" class="space-y-2 mt-2">` para os participantes, botão `id="btnAdicionarAlunos"` e botões "Salvar" (submit, bg-imperial-green) e "Cancelar" (type=button, border)
- [ ] T009 [US1] Criar painel seletor de alunos em `src/frontend/pages/games.html` — `<div id="painelSeletorAlunos" class="hidden bg-imperial-card rounded-xl border border-imperial-border shadow-sm p-4 mt-2 space-y-3">` com: `<input type="text" id="filtroNomeSeletor" placeholder="Buscar por nome...">` (classes busca), `<select id="filtroCategoriaSeletor">` preenchido com CATEGORIAS + opção "Todas as categorias", `<div id="listaSeletorAlunos" class="space-y-1 max-h-60 overflow-y-auto mt-2">` e botão `id="btnConfirmarSelecao"` ("Adicionar Selecionados", bg-imperial-green, w-full mt-2)
- [ ] T010 [US1] Implementar `renderSeletorAlunos()` em `src/frontend/pages/games.html` — lê `filtroNomeSeletor.value` e `filtroCategoriaSeletor.value`, filtra `state.alunos`, para cada aluno gera `<label class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-imperial-bg cursor-pointer"><input type="checkbox" class="aluno-check" data-aluno-id="${aluno.id}"> <div class="avatar shrink-0" style="background-color: ${cor};">${iniciais}</div> <div><div class="font-medium text-sm">${nome}</div><div class="text-xs text-imperial-text-muted">${categoria}</div></div></label>`; se lista vazia exibe mensagem "Nenhum aluno encontrado"; adicionar listeners `input`/`change` nos filtros que chamam `renderSeletorAlunos()`
- [ ] T011 [US1] Implementar `renderParticipacoes(participacoes)` em `src/frontend/pages/games.html` — limpa `#listaParticipacoes`; para cada participação busca o aluno em `state.alunos` e gera card `<div class="bg-imperial-card rounded-xl border border-imperial-border px-4 py-3 flex items-center gap-3" data-aluno-id="${p.alunoId}">` com avatar, nome, badge de categoria e `<input type="number" min="0" value="${p.minutos}" class="min-input w-16 px-2 py-1 rounded-lg border border-imperial-border text-imperial-text text-sm text-center">` + botão `<button class="btn-remover-participante text-imperial-text-muted hover:text-imperial-red" data-aluno-id="${p.alunoId}">×</button>`; adicionar listeners nos botões "×" para remover de `participacoesAtual` e re-renderizar
- [ ] T012 [US1] Implementar handler do botão `#btnAdicionarAlunos` em `src/frontend/pages/games.html` — alterna visibilidade de `#painelSeletorAlunos`; ao clicar "Adicionar Selecionados" (`#btnConfirmarSelecao`): coleta `alunoIds` dos checkboxes marcados, filtra IDs já presentes em `participacoesAtual`, adiciona `{alunoId, minutos: 0}` para cada novo, atualiza `participacoesAtual`, chama `renderParticipacoes(participacoesAtual)`, oculta `#painelSeletorAlunos`, desmarca checkboxes
- [ ] T013 [US1] Implementar `renderFormJogo(jogo)` em `src/frontend/pages/games.html` — se `jogo` é null: `jogoEditando = null`, limpa campos, `participacoesAtual = []`, título "Novo Jogo"; se `jogo` é objeto: `jogoEditando = jogo`, preenche `#inputDataJogo` e `#inputNomeJogo` com dados do jogo, `participacoesAtual = [...jogo.participacoes]`, título "Editar Jogo"; em ambos os casos: mostra `#secaoFormJogo`, oculta `#secaoLista`, chama `renderParticipacoes(participacoesAtual)`, popula `#filtroCategoriaSeletor` com CATEGORIAS
- [ ] T014 [US1] Implementar submit de `#formJogo` em `src/frontend/pages/games.html` — `e.preventDefault()`; limpar erros; ler data de `#inputDataJogo` e nome de `#inputNomeJogo`; validar: se data vazia → mostrar `#erroDataJogo` "Data é obrigatória" e return; se nome vazio → mostrar `#erroNomeJogo` "Nome é obrigatório" e return; coletar minutos: para cada `.min-input` em `#listaParticipacoes`, ler `parseInt(input.value) || 0` e atualizar `participacoesAtual`; chamar `saveJogo({ data, nome, participacoes: participacoesAtual }, jogoEditando?.id)`; `jogoEditando = null`; mostrar `#secaoLista`, ocultar `#secaoFormJogo`; chamar `renderLista()`; `showToast('Jogo salvo com sucesso!')`

**Checkpoint**: Criar jogo completo (data + nome + alunos + minutagem) via formulário funcional. US1 entregável como MVP.

---

## Phase 4: User Story 2 — Consultar Lista de Jogos (Priority: P1)

**Goal**: Professor vê todos os jogos em ordem decrescente de data com data, nome e quantidade de alunos.

**Independent Test**: Com 3 jogos em datas 2026-04-10, 2026-04-20 e 2026-04-15, abrir `games.html` → lista exibe na ordem: 2026-04-20, 2026-04-15, 2026-04-10, cada um com data formatada, nome e contagem de alunos.

### Implementation for User Story 2

- [ ] T015 [US2] Criar seção de lista em `src/frontend/pages/games.html` — `<section id="secaoLista">` com header `<div class="flex items-center justify-between mb-4">` contendo `<h2 id="tituloListagem" class="text-lg font-bold">Jogos Realizados</h2>` e botão `<button id="btnNovoJogo" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-imperial-green text-white text-sm font-semibold shadow-md">` com ícone "+" e label "Novo Jogo"; container `<div id="listaJogos" class="space-y-2" role="list" aria-live="polite">`
- [ ] T016 [US2] Implementar `renderLista()` em `src/frontend/pages/games.html` — mostra `#secaoLista`, oculta `#secaoFormJogo` e `#painelSeletorAlunos`; ordena cópia de `state.jogos` por `data` decrescente (`b.data.localeCompare(a.data)`); se vazio: `listaJogos.innerHTML = '<div class="py-14 text-center text-imperial-text-muted text-sm">Nenhum jogo registrado ainda.</div>'`; caso contrário gera para cada jogo card `<div class="bg-imperial-card rounded-xl px-4 py-3 border border-imperial-border shadow-sm flex items-center justify-between gap-3" role="listitem">` com: lado esquerdo `<div class="flex-1 min-w-0"><div class="font-semibold text-sm">${nome}</div><div class="text-xs text-imperial-text-muted mt-0.5">${formatDate(data)} · ${qtdAlunos} aluno(s)</div></div>` e lado direito com botões "Editar" (`btn-editar border border-imperial-border text-imperial-text-muted text-xs px-3 py-1.5 rounded-lg`) e "Excluir" (`btn-excluir border border-imperial-red/30 text-imperial-red text-xs px-3 py-1.5 rounded-lg hover:bg-imperial-red-light`)
- [ ] T017 [US2] Ligar eventos de lista em `src/frontend/pages/games.html` — `#btnNovoJogo` → `renderFormJogo(null)`; `.btn-editar` via delegação em `#listaJogos` → `renderFormJogo(findJogo(btn.dataset.jogoId))`; adicionar `data-jogo-id="${escapeHtml(jogo.id)}"` nos cards; cancelar formulário → `renderLista()`; ligar `#btnCancelarFormJogo` ao `document.getElementById('btnCancelarFormJogo').addEventListener('click', () => renderLista())`
- [ ] T018 [US2] Ligar botões "Excluir" em `src/frontend/pages/games.html` — via delegação em `#listaJogos`: ao clicar `.btn-excluir`, chamar `if (confirm('Excluir este jogo?')) { deleteJogo(id); renderLista(); showToast('Jogo excluído.', 'error'); }`

**Checkpoint**: Lista de jogos funcional com ordenação correta, estado vazio tratado e botões de ação conectados.

---

## Phase 5: User Story 3 — Menu "Jogos" na Navegação (Priority: P1)

**Goal**: Menu inferior com 3 itens visível em todas as telas pós-auth; "Jogos" destacado em `games.html`.

**Independent Test**: De `students.html`, clicar "Jogos" no menu → abre `games.html` com "Jogos" destacado em verde.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Atualizar menu de navegação em `src/frontend/pages/students.html` — adicionar dentro do `<nav class="fixed bottom-0...">` um terceiro `<a href="games.html" class="flex-1 flex flex-col items-center justify-center gap-1 text-imperial-text-muted hover:text-imperial-green transition-colors" aria-label="Jogos">` com ícone SVG de bola de futebol inline (circle + pentagon pattern, `w-5 h-5`) e `<span class="text-xs font-medium">Jogos</span>`; não alterar os itens "Alunos" (ativo) e "Treino" (inativo) existentes
- [ ] T020 [P] [US3] Atualizar menu de navegação em `src/frontend/pages/student-eval.html` — mesmo ícone e link "Jogos" adicionado como terceiro item; "Alunos" permanece ativo, "Treino" e "Jogos" inativos
- [ ] T021 [P] [US3] Atualizar menu de navegação em `src/frontend/pages/training.html` — mesmo ícone e link "Jogos" adicionado como terceiro item; "Treino" permanece ativo, "Alunos" e "Jogos" inativos
- [ ] T022 [US3] Criar menu de navegação em `src/frontend/pages/games.html` — antes do `</body>`: `<nav class="fixed bottom-0 left-0 right-0 bg-imperial-card border-t border-imperial-border flex h-16 z-40">` com 3 itens: "Alunos" (`href="students.html"`, inativo), "Treino" (`href="training.html"`, inativo), "Jogos" (`href="games.html"`, **ativo**: `text-imperial-green border-t-2 border-imperial-green font-semibold`, `aria-current="page"`); `<body>` já tem `pb-16`

**Checkpoint**: Menu com 3 itens visível e funcional em todas as 4 páginas com destaque correto do item ativo.

---

## Phase 6: User Story 4 — Editar Jogo Registrado (Priority: P2)

**Goal**: Professor edita data, nome, participantes e minutagem de jogo existente.

**Independent Test**: Editar jogo "vs. América" → alterar nome para "vs. Botafogo" + mudar minutos de um aluno de 45 para 60 + remover 1 aluno → salvar → lista mostra "vs. Botafogo" com contagem atualizada.

### Implementation for User Story 4

- [ ] T023 [US4] Verificar e ajustar `renderFormJogo(jogo)` em `src/frontend/pages/games.html` para modo edição — confirmar que `#inputDataJogo.value` recebe `jogo.data`, `#inputNomeJogo.value` recebe `jogo.nome`, `participacoesAtual` é inicializado como cópia profunda (`[...jogo.participacoes.map(p => ({...p}))]`) para não mutar o original antes do salvamento, título do formulário exibe "Editar Jogo"
- [ ] T024 [US4] Verificar e ajustar submit do `#formJogo` em `src/frontend/pages/games.html` para modo edição — confirmar que `saveJogo({data, nome, participacoes}, jogoEditando.id)` é chamado quando `jogoEditando !== null`, e que `saveJogo` com id atualiza corretamente o objeto em `state.jogos` sem criar duplicata; confirmar que `jogoEditando` é resetado para `null` após salvar
- [ ] T025 [US4] Verificar que o botão "Cancelar" do formulário em `src/frontend/pages/games.html` descarta todas as alterações — `renderLista()` deve ser chamado, `jogoEditando` resetado para `null` e `participacoesAtual` limpo sem persistir nada

**Checkpoint**: Edição de jogo existente funcional — alterações persistem ao salvar; cancelamento não afeta o jogo original.

---

## Phase 7: User Story 5 — Excluir Jogo (Priority: P2)

**Goal**: Professor exclui jogo com confirmação explícita.

**Independent Test**: Clicar "Excluir" em jogo "vs. América" → diálogo de confirmação → confirmar → jogo desaparece da lista + toast de sucesso.

### Implementation for User Story 5

- [ ] T026 [US5] Verificar e ajustar handler de exclusão em `src/frontend/pages/games.html` — confirmar que ao clicar `.btn-excluir` o fluxo é: `window.confirm('Excluir este jogo? Esta ação não pode ser desfeita.')` → se false: não faz nada → se true: `deleteJogo(id)` → `renderLista()` → `showToast('Jogo excluído.', 'error')`; confirmar que o jogo de fato desaparece do array `state.jogos` persistido

**Checkpoint**: Exclusão com confirmação funcional; cancelamento não afeta a lista.

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Validações, mensagens de erro, responsividade e fluxo completo.

- [ ] T027 Implementar validação completa do formulário de jogo em `src/frontend/pages/games.html` — verificar comportamento: data vazia → erro inline `#erroDataJogo` visível + foco no campo + return; nome vazio → erro inline `#erroNomeJogo` + foco + return; campo `#inputDataJogo` recebe `max` = `todayISO()` para sugestão (sem bloqueio); inicializar `#filtroCategoriaSeletor` com opções de CATEGORIAS no boot
- [ ] T028 [P] Exibir mensagem amigável no painel seletor quando não há alunos cadastrados em `src/frontend/pages/games.html` — em `renderSeletorAlunos()`: se `state.alunos.length === 0` exibir `<div class="py-6 text-center text-imperial-text-muted text-sm">Nenhum aluno cadastrado no sistema.</div>` e ocultar `#btnConfirmarSelecao`; caso contrário mostrar botão
- [ ] T029 [P] Validar responsividade de `src/frontend/pages/games.html` em 375 px no DevTools — confirmar: menu com 3 itens sem overflow horizontal; painel seletor de alunos rolável (`max-h-60 overflow-y-auto`) e utilizável; inputs de minutos (`w-16`) não causam overflow nos cards; botões Editar/Excluir acessíveis sem scroll horizontal
- [ ] T030 Executar fluxo completo de validação conforme `specs/008-match-minutes/quickstart.md` — 15 passos: login → menu 3 itens → criar jogo → adicionar alunos → minutagem → salvar → lista correta → criar mais 2 jogos → verificar ordem decrescente → editar → excluir → menu em todas as páginas → confirmar zero regressões em `students.html`, `student-eval.html` e `training.html`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente (T001–T003)
- **Foundational (Phase 2)**: Depende de T001–T003 — bloqueia todas as user stories (T004–T007)
- **US1 (Phase 3)**: Depende de Foundational — MVP ao concluir (T008–T014)
- **US2 (Phase 4)**: Depende de US1 (reutiliza `renderFormJogo` e estrutura de `games.html`) — T015–T018
- **US3 (Phase 5)**: Independente de US1/US2 — pode rodar em paralelo após Foundational; T019–T021 são paralelas entre si (arquivos distintos); T022 depende de T001
- **US4 (Phase 6)**: Depende de US1 (ajusta `renderFormJogo`) e US2 (`renderLista`) — T023–T025
- **US5 (Phase 7)**: Depende de US2 (handler de exclusão já iniciado em T018) — T026
- **Polish (Phase 8)**: Depende de todas as user stories — T027–T030

### User Story Dependencies

- **US1 (P1)**: Depende somente de Foundational
- **US2 (P1)**: Depende de US1 (mesma página, precisa de `renderFormJogo` e `jogoEditando`)
- **US3 (P1)**: Independente — arquivos distintos; T019/T020/T021 paralelas entre si
- **US4 (P2)**: Depende de US1 + US2 (ajustes no fluxo já implementado)
- **US5 (P2)**: Depende de US2 (handler no `#listaJogos`)

### Within Each User Story

- HTML antes de JS handlers
- Estrutura DOM antes de `renderX()` functions
- Funções de render antes de listeners de eventos

### Parallel Opportunities

- T001–T003 (Setup): sem dependências externas, podem iniciar imediatamente
- T019, T020, T021 (menu em arquivos distintos): totalmente paralelas
- T028 e T029 (Polish): arquivos distintos ou seções independentes

---

## Parallel Example: User Story 3

```text
# Rodam ao mesmo tempo após T001 (games.html criado com menu base):
T019 — Menu em students.html    (arquivo distinto)
T020 — Menu em student-eval.html  (arquivo distinto)
T021 — Menu em training.html    (arquivo distinto)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 Apenas)

1. Concluir Phase 1: Setup (T001–T003)
2. Concluir Phase 2: Foundational (T004–T007)
3. Concluir Phase 3: US1 (T008–T014)
4. Concluir Phase 4: US2 (T015–T018)
5. Concluir Phase 5: US3 (T019–T022)
6. **PARAR e VALIDAR**: Professor acessa jogos pelo menu, cria jogo completo, vê na lista ✓
7. MVP entregável: funcionalidade de minutagem utilizável no dia a dia

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → formulário de criação funcional
3. US2 → lista de jogos + botões de ação conectados → **Demo MVP**
4. US3 → menu 3 itens em todas as páginas → **Demo navegação completa**
5. US4 + US5 → edição e exclusão → **Demo CRUD completo**
6. Polish → validações e responsividade → **Entrega final**

---

## Notes

- [P] = arquivos distintos, sem dependência entre tarefas marcadas
- `loadState()` em `games.html` DEVE preservar campos existentes (`alunos`, `avaliacoes`, `chamadas`) — apenas adicionar `jogos: []` se ausente
- O `tailwind.config` em `games.html` deve ser idêntico ao das outras páginas (tokens da feature 006)
- Ícone SVG de bola de futebol para o menu: usar `<circle cx="12" cy="12" r="10"/>` com pentagons internos — ou simplificar com um ícone de "grid" se SVG complexo atrasar
- Em caso de dúvida sobre o visual esperado, consultar `src/frontend/pages/students.html` e `src/frontend/pages/training.html` como referência de padrão visual
- Commitar após cada phase concluída
