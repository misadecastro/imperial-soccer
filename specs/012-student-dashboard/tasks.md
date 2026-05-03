# Tasks: Dashboard do Aluno

**Input**: Design documents from `/specs/012-student-dashboard/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação por inspeção visual manual e fluxo funcional (ver [quickstart.md](quickstart.md), 28 passos cobrindo regressão da feature 011 + novos cenários da aba Alunos).

**Organization**: Tarefas agrupadas por user story para implementação incremental e testável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependências)
- **[Story]**: User story correspondente da spec.md

## Path Conventions

```text
src/frontend/
├── index.html                       ← sem alteração
├── css/
│   └── imperial.css                 ← sem alteração
└── pages/
    ├── dashboard.html               ← NOVO (página unificada com toggle)
    ├── dashboard-treinos.html       ← REMOVIDO ao final (conteúdo migrado)
    ├── students.html                ← apenas link do nav inferior
    ├── training.html                ← apenas link do nav inferior
    ├── games.html                   ← apenas link do nav inferior
    ├── student-eval.html            ← sem alteração
    └── login.html                   ← sem alteração
```

---

## Phase 1: Setup (Esqueleto da Página Unificada)

**Purpose**: Criar `dashboard.html` com `<head>`, `<body>`, header, tabs, duas `<section>`s vazias (view-treinos e view-alunos) e nav inferior. Sem JavaScript funcional ainda.

- [X] T001 Criar arquivo `src/frontend/pages/dashboard.html` com `<!DOCTYPE html>`, `<html lang="pt-BR">` e `<head>` contendo: `<meta charset="UTF-8">`, viewport, `<title>Imperial Soccer — Dashboard</title>`, `<script src="https://cdn.tailwindcss.com"></script>`, `<link rel="stylesheet" href="../css/imperial.css">`, `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` (carregado fora de módulo para escopo global), e `<script>` com `tailwind.config` idêntico ao de `dashboard-treinos.html` (paleta `imperial`)
- [X] T002 Adicionar `<body class="bg-imperial-bg text-imperial-text min-h-screen flex flex-col pb-16">` em `src/frontend/pages/dashboard.html` com `<header>` verde idêntico ao de `dashboard-treinos.html` mas com texto neutro: título "Dashboard" e subtítulo "Volume e conteúdo trabalhado" (ícone SVG do gráfico de barras igual ao atual); abaixo do header adicionar `<main class="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">` vazio (será preenchido nas próximas tarefas)
- [X] T003 Adicionar como primeiro filho de `<main>` em `src/frontend/pages/dashboard.html` a barra de tabs: `<section id="secaoTabs" class="bg-imperial-card rounded-xl border border-imperial-border p-2 shadow-sm"><div id="tabsToggle" class="flex gap-2" role="tablist" aria-label="Selecionar dashboard"><button type="button" data-tab="treinos" role="tab" aria-pressed="true" aria-controls="view-treinos" class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-imperial-green text-white border border-imperial-green focus:outline-none focus:ring-2 focus:ring-imperial-green">Treinos</button><button type="button" data-tab="alunos" role="tab" aria-pressed="false" aria-controls="view-alunos" class="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-imperial-card text-imperial-text border border-imperial-border hover:border-imperial-green focus:outline-none focus:ring-2 focus:ring-imperial-green">Alunos</button></div></section>`
- [X] T004 Adicionar a `<section id="view-treinos" role="tabpanel" aria-labelledby="tab-treinos" class="space-y-4">` em `src/frontend/pages/dashboard.html` (logo após a barra de tabs) contendo a estrutura existente da feature 011 — copiar **verbatim** o markup de `<main>` de `src/frontend/pages/dashboard-treinos.html` linhas ~49–96 (Seleção de Categoria `#secaoCategoria`/`#seletorCategoria`, Cards Resumo `#cardsResumo`, Volume por Momento `canvas#canvasVolume` + `#emptyVolume`, Distribuição+Top 8 com `canvas#canvasDistribuicao`/`#emptyDistribuicao`/`#listaTopPrincipios`, Sessões Recentes `#listaSessoesRecentes`); preservar todos os IDs, classes e estrutura sem alteração
- [X] T005 Adicionar a `<section id="view-alunos" role="tabpanel" aria-labelledby="tab-alunos" class="hidden space-y-4">` em `src/frontend/pages/dashboard.html` (logo após `view-treinos`) com os contêineres vazios em ordem: (a) `<section id="secaoCategoriaAluno" class="bg-imperial-card rounded-xl border border-imperial-border p-3 shadow-sm"><label class="block text-xs text-imperial-text-muted mb-2">Categoria</label><div id="seletorCategoriaAluno" class="flex flex-wrap gap-2" role="group" aria-label="Selecionar categoria do aluno"></div></section>`, (b) `<section class="bg-imperial-card rounded-xl border border-imperial-border p-3 shadow-sm"><label class="block text-xs text-imperial-text-muted mb-2">Aluno</label><input id="inputBuscaAluno" type="search" placeholder="Buscar aluno por nome..." aria-label="Buscar aluno por nome" class="w-full px-3 py-2 rounded-lg border border-imperial-border focus:outline-none focus:ring-2 focus:ring-imperial-green text-sm mb-2"><div id="listaAlunos" class="flex flex-wrap gap-2"></div></section>`, (c) `<section id="cabecalhoAluno" class="hidden bg-imperial-green rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"></section>`, (d) `<section id="placeholderAluno" class="bg-imperial-card rounded-xl border border-imperial-border px-4 py-8 shadow-sm text-center text-sm text-imperial-text-muted">Selecione um aluno para visualizar seus dados</section>`, (e) `<div id="blocosAluno" class="hidden space-y-4">` envolvendo: cards de treinos (`<section id="cardsTreinosAluno" class="grid grid-cols-3 gap-3"></section>`), gráfico volume por momento do aluno (`<section class="bg-imperial-card rounded-xl border border-imperial-border p-4 shadow-sm"><h3 class="text-sm font-semibold mb-1">Volume de treino por momento</h3><p class="text-xs text-imperial-text-muted mb-3">Sessões em que esteve presente</p><div class="relative h-48"><canvas id="canvasVolumeAluno"></canvas><p id="emptyVolumeAluno" class="hidden absolute inset-0 flex items-center justify-center text-xs text-imperial-text-muted">Sem treinos registrados.</p></div></section>`), princípios absorvidos (`<section class="bg-imperial-card rounded-xl border border-imperial-border p-4 shadow-sm"><h3 class="text-sm font-semibold mb-1">Princípios e fundamentos absorvidos</h3><p class="text-xs text-imperial-text-muted mb-3">Itens trabalhados nas sessões em que esteve presente</p><ul id="listaPrincipiosAbsorvidos" class="space-y-2"></ul></section>`), cards de jogos (`<section id="cardsJogosAluno" class="grid grid-cols-3 gap-3"></section>`), gráfico minutagem (`<section class="bg-imperial-card rounded-xl border border-imperial-border p-4 shadow-sm"><h3 class="text-sm font-semibold mb-1">Minutagem em jogos</h3><p class="text-xs text-imperial-text-muted mb-3">Minutos jogados por partida</p><div class="relative h-48"><canvas id="canvasMinutagem"></canvas><p id="emptyMinutagem" class="hidden absolute inset-0 flex items-center justify-center text-xs text-imperial-text-muted">Sem jogos registrados.</p></div></section>`), histórico (`<section class="bg-imperial-card rounded-xl border border-imperial-border p-4 shadow-sm"><h3 class="text-sm font-semibold mb-3">Histórico de Jogos</h3><ul id="listaHistoricoJogos" class="divide-y divide-imperial-border" role="list"></ul></section>`) e fechar `</div>`
- [X] T006 Adicionar nav inferior em `src/frontend/pages/dashboard.html` — `<nav class="fixed bottom-0 left-0 right-0 bg-imperial-card border-t border-imperial-border flex h-16 z-40">` com 4 abas (`flex-1` em cada `<a>`): Alunos (`students.html`, ícone usuários), Treino (`training.html`, ícone calendário), Jogos (`games.html`, ícone bola), Dashboard (`dashboard.html`, ícone gráfico de barras) — esta última aba marcada como ativa (`text-imperial-green font-semibold border-t-2 border-imperial-green` + `aria-current="page"`); os SVGs e classes são idênticos aos de `dashboard-treinos.html`

**Checkpoint**: Página `dashboard.html` carrega no browser exibindo toggle, view-treinos vazia (Treinos ativo por default) e view-alunos oculta. Sem JavaScript ainda.

---

## Phase 2: Foundational (Constantes, Estado, Migração de JS da Aba Treinos, Tab Toggle)

**Purpose**: Toda a lógica não-visual da página + migração 1:1 do JS da aba Treinos. Esta fase BLOQUEIA todas as user stories da aba Alunos.

**⚠️ CRÍTICO**: Sem o tab toggle e sem a migração da aba Treinos preservada, a página não funciona nem para Treinos.

- [X] T007 Adicionar bloco `<script type="module">` ao final de `<body>` em `src/frontend/pages/dashboard.html` declarando todas as constantes do domínio (compartilhadas entre as duas abas): `const CATEGORIAS = ['Sub09','Sub10','Sub11','Sub12','Sub13','Sub14']`; `const CATEGORIAS_LABELS = { ... }`; `const MOMENTOS = [...]`; `const PRINCIPIOS_GRUPOS = [...]` — copiar **verbatim** de `src/frontend/pages/dashboard-treinos.html` linhas ~122–172 (incluindo o campo `filtro` de cada grupo); adicionar também as constantes específicas: `const STATE_KEY = 'imperialState'`, `const DURACAO_TREINO_MIN = 60`, `const TOP_PRINCIPIOS_LIMITE = 8`, `const SESSOES_RECENTES_LIMITE = 6`, `const FAMILIAS_LABEL = { ... }`, `const FAMILIAS_COR = { ... }`, `const MOMENTOS_COR = { ... }`
- [X] T008 Implementar `loadState()` e `saveState()` em `src/frontend/pages/dashboard.html` — idênticas a `dashboard-treinos.html` linhas ~200–217 (lê/escreve em `sessionStorage` com `STATE_KEY`; default `{ alunos:[], avaliacoes:[], chamadas:[], jogos:[] }`); declarar variáveis de módulo: `const state = loadState()`; bloco da **aba Treinos** com `let categoriaSelecionada = 'Sub09'`, `let chartVolume = null`, `let chartDistribuicao = null`; bloco da **aba Alunos** com `let alunoTabInicializada = false`, `let categoriaAluno = null`, `let termoBusca = ''`, `let alunoSelecionado = null`, `let chartVolumeAluno = null`, `let chartMinutagem = null`
- [X] T009 Implementar funções utilitárias em `src/frontend/pages/dashboard.html` — `formatDate(iso)` (ISO `YYYY-MM-DD` → `DD/MM/AAAA`, idêntica a `dashboard-treinos.html` ~225–229), `formatDDMM(iso)` (NOVA: ISO → `DD/MM` para labels do gráfico de minutagem), `escapeHtml(str)` (idêntica), `getMomentoLabel(id)`, `getPrincipioInfo(id)` (varre `PRINCIPIOS_GRUPOS`, retorna `{ label, filtro }` ou `null`), `getIniciais(nome)` (NOVA: pega a primeira letra das primeiras 2 palavras maiúsculas do `nome` — ex.: "Lucas Silva" → "LS"; "Pedro Henrique de Souza" → "PH")
- [X] T010 Migrar JS completo da aba Treinos em `src/frontend/pages/dashboard.html` — copiar **verbatim** de `src/frontend/pages/dashboard-treinos.html` os blocos: (a) `MOCK_CHAMADAS_DASHBOARD` e `makeRegistros` e `ensureMockData()` (linhas ~248–365), (b) `computeDashboardData(categoria)` (linhas ~367–459), (c) `renderCategorySelector()`, `applyCategoryButtonClasses(btn, selected)`, `selectCategoria(cat)` (linhas ~461–499) — **renomear** `renderCategorySelector` → `renderCategorySelectorTreinos`, `selectCategoria` → `selectCategoriaTreinos` para evitar colisão com a aba Alunos; ajustar referências internas e o handler do `#seletorCategoria` para chamar `selectCategoriaTreinos(target.dataset.cat)`, (d) `renderSummaryCards`, `ICON_*` constants, `renderVolumeChart`, `renderDistribuicaoChart`, `renderTopPrincipios`, `renderSessoesRecentes` (linhas ~501–660) — sem renomear (não há colisão), (e) `refresh()` da Treinos — renomear para `refreshTreinos()` para clareza; chamar dentro `computeDashboardData(categoriaSelecionada)` e os 5 renders da Treinos
- [X] T011 Implementar tab toggle em `src/frontend/pages/dashboard.html` — função `selectTab(tabId)` que: (1) atualiza `aria-pressed` e classes dos botões `[data-tab]` em `#tabsToggle` (ativo recebe `bg-imperial-green text-white border-imperial-green`, inativo recebe `bg-imperial-card text-imperial-text border-imperial-border hover:border-imperial-green`); (2) alterna `classList.toggle('hidden', ...)` em `#view-treinos` e `#view-alunos`; (3) se `tabId === 'alunos' && !alunoTabInicializada`, chama `initAlunoTab()` (stub vazio por enquanto, será preenchido na US1); registrar event listener em `#tabsToggle` por delegação que chama `selectTab(target.dataset.tab)`; criar `init()` global que: (1) chama `ensureMockData()` (preserva comportamento da aba Treinos), (2) chama `renderCategorySelectorTreinos()`, (3) chama `selectCategoriaTreinos(categoriaSelecionada)` (que dispara `refreshTreinos()`), (4) registra listener do toggle; rodar `init()` em `DOMContentLoaded`

**Checkpoint**: Página abre, aba Treinos funciona idêntica ao `dashboard-treinos.html` original (4 cards, 2 charts, top 8, sessões recentes — tudo populado pelos mocks), botão "Alunos" alterna a visibilidade mas a aba Alunos ainda exibe estado vazio.

---

## Phase 3: User Story 1 — Selecionar Aluno e Ver Resumo de Treinos (Priority: P1) 🎯 MVP

**Goal**: Professor abre o dashboard, alterna para "Alunos", escolhe uma categoria, opcionalmente busca por nome, clica num aluno e vê instantaneamente nome+categoria do aluno e os 3 cards de resumo de treinos (Presenças, Frequência, Itens Trabalhados).

**Independent Test**: Com `state.alunos` e `state.chamadas` populados (cadastrar via telas existentes), abrir `dashboard.html` → clicar em Alunos → escolher Sub 09 → digitar parte do nome do aluno → clicar no aluno na lista → verificar (a) cabeçalho do aluno aparece com avatar+nome+categoria, (b) os 3 cards exibem números coerentes, (c) trocar de categoria limpa a seleção, (d) trocar para Treinos e voltar preserva tanto o estado da Treinos quanto da Alunos.

### Implementation for User Story 1

- [X] T012 [US1] Implementar `renderCategoriasAluno()` em `src/frontend/pages/dashboard.html` — para cada `cat` em `CATEGORIAS` cria `<button type="button" data-cat="${cat}" aria-pressed="${cat === categoriaAluno}">${CATEGORIAS_LABELS[cat]}</button>`; reusar `applyCategoryButtonClasses(btn, selected)` da migração da Treinos para o estilo dos botões; inserir no container `#seletorCategoriaAluno`; registrar `addEventListener('click')` por delegação que chama `selectCategoriaAluno(e.target.dataset.cat)`
- [X] T013 [US1] Implementar `selectCategoriaAluno(cat)` em `src/frontend/pages/dashboard.html` — `if (!CATEGORIAS.includes(cat)) return`; `categoriaAluno = cat`; atualizar `aria-pressed` e classes dos botões em `#seletorCategoriaAluno`; **limpar** `alunoSelecionado = null` (FR-005, US1 cenário 6); chamar `renderListaAlunos()` e `clearAlunoView()`
- [X] T014 [US1] Implementar `renderListaAlunos()` em `src/frontend/pages/dashboard.html` — filtrar `state.alunos` por `aluno.categoria === categoriaAluno` e (se `termoBusca !== ''`) por `aluno.nome.toLowerCase().includes(termoBusca)`; renderizar dentro de `#listaAlunos` botões pill no padrão: `<button type="button" data-aluno-id="${a.id}" aria-pressed="${a.id === alunoSelecionado}" class="px-3 py-1.5 rounded-full text-sm border ${selecionado ? 'bg-imperial-green text-white border-imperial-green' : 'bg-imperial-card text-imperial-text border-imperial-border hover:border-imperial-green'}">${escapeHtml(a.nome)}</button>`; estados vazios: se nenhum aluno na categoria, exibir `<p class="text-xs text-imperial-text-muted">Nenhum aluno nesta categoria.</p>`; se busca não retorna resultados, exibir `<p class="text-xs text-imperial-text-muted">Nenhum aluno encontrado para "${escapeHtml(termoBusca)}".</p>`; registrar listener por delegação que chama `selectAluno(target.dataset.alunoId)`
- [X] T015 [US1] Implementar `onBuscaInput(termo)` em `src/frontend/pages/dashboard.html` — `termoBusca = String(termo || '').trim().toLowerCase()`; chamar `renderListaAlunos()`; registrar `addEventListener('input')` no `#inputBuscaAluno` que chama `onBuscaInput(e.target.value)`
- [X] T016 [US1] Implementar `selectAluno(alunoId)` e `renderHeaderAluno(aluno)` em `src/frontend/pages/dashboard.html` — `selectAluno`: localiza `aluno = state.alunos.find(a => a.id === alunoId && a.categoria === categoriaAluno)`; se não encontrado, `return`; `alunoSelecionado = aluno.id`; atualiza `aria-pressed` e classes dos botões em `#listaAlunos` (apenas o pill clicado fica ativo); chama `refreshAluno()` (a definir na T019); `renderHeaderAluno(aluno)`: preenche `#cabecalhoAluno` com `<div class="w-12 h-12 rounded-full bg-white text-imperial-green font-bold flex items-center justify-center text-lg shrink-0">${escapeHtml(getIniciais(aluno.nome))}</div><div class="min-w-0"><div class="text-base font-bold text-white leading-tight truncate">${escapeHtml(aluno.nome)}</div><div class="text-xs text-white/80">${escapeHtml(CATEGORIAS_LABELS[aluno.categoria] || aluno.categoria)}</div></div>` e remove `hidden`
- [X] T017 [US1] Implementar `clearAlunoView()` em `src/frontend/pages/dashboard.html` — esconde `#cabecalhoAluno` (`classList.add('hidden')`), esconde `#blocosAluno` (`classList.add('hidden')`), mostra `#placeholderAluno` (`classList.remove('hidden')`); destrói instâncias dos charts da aba Alunos se existirem (`if (chartVolumeAluno) { chartVolumeAluno.destroy(); chartVolumeAluno = null; }`, idem `chartMinutagem`); chamada por `selectCategoriaAluno()` e por `initAlunoTab()` quando ainda não há aluno selecionado
- [X] T018 [US1] Implementar `computeAlunoData(aluno)` e `renderResumoTreinos(data)` em `src/frontend/pages/dashboard.html` — `computeAlunoData`: implementa o algoritmo descrito em [data-model.md](data-model.md#algoritmo-computealunodataaluno) — calcula `presencas`, `convocacoes`, `frequenciaPct` (null se convocacoes===0), `totalItens` a partir de `state.chamadas` filtradas pela `aluno.categoria` e cruzadas com `aluno.id` em `registros`; campos de jogos (`jogosDisputados`, `minutosTotal`, `mediaPorJogo`, `minutagemSeries`, `historicoJogos`) podem retornar valores zero/vazios nesta tarefa (serão usados nas próximas US); retornar a estrutura `AlunoDashboardData` completa; `renderResumoTreinos(data)`: limpa `#cardsTreinosAluno` e gera 3 cards no formato igual à aba Treinos: (1) Presenças (ícone calendário, valor `${data.presencas}/${data.convocacoes}`), (2) Frequência (ícone tendência, valor `${data.frequenciaPct === null ? '—' : data.frequenciaPct + '%'}`), (3) Itens Trabalhados (ícone lista, valor `data.totalItens`); reusar as constantes `ICON_CALENDAR`, `ICON_TREND`, `ICON_LIST` da migração da Treinos
- [X] T019 [US1] Implementar `initAlunoTab()` e `refreshAluno()` em `src/frontend/pages/dashboard.html` — `initAlunoTab()` (idempotente): se `alunoTabInicializada` retorna; senão, escolhe `categoriaAluno` = primeira categoria de `CATEGORIAS` com `state.alunos.some(a => a.categoria === cat)`, fallback `CATEGORIAS[0]`; chama `renderCategoriasAluno()`, `renderListaAlunos()`, `clearAlunoView()`; registra listeners do `#inputBuscaAluno` (input) e do `#listaAlunos` (click delegation); marca `alunoTabInicializada = true`; `refreshAluno()`: se `alunoSelecionado === null`, chama `clearAlunoView()` e retorna; localiza `aluno = state.alunos.find(a => a.id === alunoSelecionado)`; se não encontrado, `clearAlunoView()` e retorna; `const data = computeAlunoData(aluno)`; mostra `#blocosAluno` (`classList.remove('hidden')`); esconde `#placeholderAluno` (`classList.add('hidden')`); chama `renderHeaderAluno(aluno)` e `renderResumoTreinos(data)`; deixar stubs vazios para `renderVolumeMomentoAluno`, `renderPrincipiosAbsorvidos`, `renderResumoJogos`, `renderMinutagemChart`, `renderHistoricoJogos` (serão preenchidos nas próximas US); atualizar `selectTab('alunos')` para chamar `initAlunoTab()` se não inicializada

**Checkpoint**: MVP entregável da US1: toggle funcional, aba Alunos com seletor de categoria, busca por nome, lista de alunos, seleção, cabeçalho do aluno e os 3 cards de resumo de treinos batendo numericamente. Demais blocos exibem skeletons vazios mas a página não quebra. Aba Treinos preservada sem regressão.

---

## Phase 4: User Story 2 — Gráficos de Treino do Aluno (Priority: P2)

**Goal**: Após selecionar um aluno, visualizar os dois gráficos de treino: barras de "Volume de treino por momento" (apenas sessões com presença) e barras horizontais de "Princípios e fundamentos absorvidos" (itens das sessões com presença, ordenados por contagem decrescente).

**Independent Test**: Selecionar um aluno com presenças cobrindo diferentes momentos e itens; verificar que (a) o bar chart mostra 4 barras coloridas com altura proporcional, (b) a lista de princípios absorvidos exibe N itens em ordem decrescente, com label, barra horizontal e count.

### Implementation for User Story 2

- [X] T020 [US2] Implementar `renderVolumeMomentoAluno(data)` em `src/frontend/pages/dashboard.html` — espelhar a função `renderVolumeChart` da aba Treinos mas operando sobre `data.volumePorMomento` (já considera apenas `chamadasPresente` em `computeAlunoData`): se total === 0, mostrar `#emptyVolumeAluno` e esconder canvas (destruir `chartVolumeAluno` se existir); senão, esconder o empty, destruir chart anterior se existir, criar `chartVolumeAluno = new Chart(canvas#canvasVolumeAluno, { type: 'bar', data: { labels: MOMENTOS.map(m => m.label), datasets: [{ data: MOMENTOS.map(m => data.volumePorMomento[m.id] || 0), backgroundColor: MOMENTOS.map(m => MOMENTOS_COR[m.id]), borderRadius: 6, barThickness: 28 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }, x: { grid: { display: false } } } })`; chamar dentro de `refreshAluno()` (substituir o stub vazio)
- [X] T021 [US2] Implementar `renderPrincipiosAbsorvidos(data)` em `src/frontend/pages/dashboard.html` — limpa `#listaPrincipiosAbsorvidos`; se `data.principiosAbsorvidos.length === 0`, exibe `<li class="text-xs text-imperial-text-muted py-2">Nenhum princípio ou fundamento absorvido.</li>`; senão, calcula `maxCount = Math.max(...data.principiosAbsorvidos.map(p => p.count))` e renderiza para cada item: `<li class="flex items-center gap-3 text-sm"><span class="flex-1 min-w-0 truncate text-imperial-text">${escapeHtml(p.label)}</span><div class="flex-1 h-2 bg-imperial-green-light rounded-full overflow-hidden"><div class="h-full rounded-full" style="width: ${(p.count / maxCount) * 100}%; background-color: ${FAMILIAS_COR[p.familia] || '#16a34a'}"></div></div><span class="w-6 text-right font-semibold text-imperial-green">${p.count}</span></li>`; chamar dentro de `refreshAluno()` (substituir o stub vazio)

**Checkpoint**: US2 entregável: ao selecionar um aluno, os dois gráficos de treino aparecem corretos. Trocar de aluno recalcula e re-renderiza. Selecionar aluno sem presenças exibe estados vazios apropriados.

---

## Phase 5: User Story 3 — Resumo de Jogos e Minutagem por Partida (Priority: P2)

**Goal**: Após selecionar um aluno, exibir os 3 cards de resumo de jogos (Jogos disputados, Minutos em Jogo, Média por jogo) e o gráfico de linha "Minutagem em jogos" com os minutos jogados em cada partida em ordem cronológica.

**Independent Test**: Selecionar um aluno com 3 jogos cadastrados (minutos 30, 25, 45); verificar (a) cards exibem 3, 100, 33; (b) line chart com 3 pontos ordenados cronologicamente, eixo X com labels DD/MM e eixo Y com minutos. Trocar para aluno sem jogos exibe `0`, `0`, `—` nos cards e estado vazio no gráfico.

### Implementation for User Story 3

- [X] T022 [US3] Implementar `renderResumoJogos(data)` em `src/frontend/pages/dashboard.html` — limpa `#cardsJogosAluno` e gera 3 cards no formato igual aos cards de treinos: (1) Jogos disputados (ícone calendário, valor `data.jogosDisputados`), (2) Min em Jogo (ícone relógio, valor `data.minutosTotal`), (3) Média por jogo (ícone tendência, valor `${data.mediaPorJogo === null ? '—' : data.mediaPorJogo + ' min'}`); reusar `ICON_CALENDAR`, `ICON_CLOCK`, `ICON_TREND` da migração da Treinos; chamar dentro de `refreshAluno()` (substituir o stub vazio)
- [X] T023 [US3] Implementar `renderMinutagemChart(data)` em `src/frontend/pages/dashboard.html` — se `data.minutagemSeries.length === 0`, mostrar `#emptyMinutagem` e esconder canvas (destruir `chartMinutagem` se existir); senão, esconder o empty, destruir chart anterior, criar `chartMinutagem = new Chart(canvas#canvasMinutagem, { type: 'line', data: { labels: data.minutagemSeries.map(s => s.label), datasets: [{ data: data.minutagemSeries.map(s => s.minutos), borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.15)', fill: true, tension: 0.25, pointRadius: 4, pointBackgroundColor: '#16a34a', pointBorderColor: '#fff', pointBorderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { title: (items) => items[0].label, label: (item) => item.parsed.y + ' min' } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 5, precision: 0 } }, x: { grid: { display: false } } } })`; chamar dentro de `refreshAluno()` (substituir o stub vazio)

**Checkpoint**: US3 entregável: cards de jogos e gráfico de minutagem aparecem corretos para alunos com jogos; estados vazios consistentes para alunos sem jogos.

---

## Phase 6: User Story 4 — Histórico de Jogos do Aluno (Priority: P3)

**Goal**: Após selecionar um aluno, exibir no rodapé da aba a lista cronológica decrescente dos jogos do aluno, com data formatada, nome e minutos.

**Independent Test**: Selecionar um aluno com 4 jogos em datas distintas; verificar lista mostra os 4 jogos em ordem decrescente, com `DD/MM/AAAA — Nome do Jogo` à esquerda e `N min` à direita. Selecionar aluno sem jogos exibe "Nenhum jogo registrado".

### Implementation for User Story 4

- [X] T024 [US4] Implementar `renderHistoricoJogos(data)` em `src/frontend/pages/dashboard.html` — limpa `#listaHistoricoJogos`; se `data.historicoJogos.length === 0`, exibe `<li class="py-3 text-xs text-imperial-text-muted">Nenhum jogo registrado.</li>`; senão renderiza para cada item: `<li class="py-3 flex items-start justify-between gap-3" role="listitem"><div class="flex-1 min-w-0"><div class="text-sm font-semibold text-imperial-text">${formatDate(j.data)} — ${escapeHtml(j.nome)}</div></div><div class="text-right shrink-0"><div class="text-xs text-imperial-text-muted">Minutos</div><div class="text-sm font-bold text-imperial-green">${j.minutos}</div></div></li>`; chamar dentro de `refreshAluno()` (substituir o stub vazio)

**Checkpoint**: US4 entregável: histórico de jogos completo. Aba Alunos com todos os blocos funcionando — feature completa do ponto de vista da aba Alunos.

---

## Phase 7: Polish & Cross-Cutting (Atualização de Navegação e Limpeza)

**Purpose**: Atualizar links de navegação das demais páginas para apontarem à nova `dashboard.html` e remover o arquivo legacy. Validação final completa pelo quickstart.

- [X] T025 [P] Atualizar nav inferior em `src/frontend/pages/students.html` — localizar o `<a>` cujo `href="dashboard-treinos.html"` (item Dashboard do nav inferior) e alterar para `href="dashboard.html"`; nenhuma outra mudança neste arquivo
- [X] T026 [P] Atualizar nav inferior em `src/frontend/pages/training.html` — localizar o `<a>` cujo `href="dashboard-treinos.html"` (item Dashboard do nav inferior) e alterar para `href="dashboard.html"`; nenhuma outra mudança neste arquivo
- [X] T027 [P] Atualizar nav inferior em `src/frontend/pages/games.html` — localizar o `<a>` cujo `href="dashboard-treinos.html"` (item Dashboard do nav inferior) e alterar para `href="dashboard.html"`; nenhuma outra mudança neste arquivo
- [X] T028 Verificar que nenhum outro arquivo do projeto referencia `dashboard-treinos.html` (Grep por `dashboard-treinos` em todo o `src/frontend/`); se houver alguma referência remanescente além de `dashboard.html` (ex.: `student-eval.html`, `index.html`, `login.html`), corrigir; em seguida deletar `src/frontend/pages/dashboard-treinos.html` (arquivo migrado integralmente para `dashboard.html` na Phase 2)
- [ ] T029 Executar [quickstart.md](quickstart.md) ponta a ponta — todos os 28 passos das seções A–L; conferir checklist de aprovação no final do quickstart; especialmente os critérios de regressão da feature 011 (aba Treinos não pode regredir); registrar quaisquer ajustes pontuais necessários **— PENDENTE: validação manual no browser**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências; pode começar imediatamente.
- **Phase 2 (Foundational)**: Depende de Phase 1 (HTML containers precisam existir). **BLOQUEIA todas as user stories**.
- **Phase 3 (US1 — P1, MVP)**: Depende de Phase 2.
- **Phase 4 (US2 — P2)**: Depende de Phase 3 (precisa de `refreshAluno()` e do pipeline de seleção do aluno).
- **Phase 5 (US3 — P2)**: Depende de Phase 3 (mesmas razões da US2). **PODE rodar em paralelo com Phase 4** se houver dois desenvolvedores — funções e blocos HTML são distintos, mas ambos editam `dashboard.html`. Em ambiente single-dev, sequencial.
- **Phase 6 (US4 — P3)**: Depende de Phase 3.
- **Phase 7 (Polish)**: Depende das User Stories que serão entregues (no mínimo Phase 2 + Phase 3 para o MVP).

### User Story Dependencies

- **US1 (P1)**: Requer Phase 2 completa. Independente de US2/US3/US4 — entrega valor sozinha (cards de treinos).
- **US2 (P2)**: Requer Phase 2 + Phase 3. Independente de US3/US4.
- **US3 (P2)**: Requer Phase 2 + Phase 3. Independente de US2/US4.
- **US4 (P3)**: Requer Phase 2 + Phase 3. Independente de US2/US3.

### Within Each User Story

- Modelos de dados / cálculo (compute) antes de render.
- Em cada US o que muda em `refreshAluno()` é apenas a chamada de uma função de render adicional — não há reordenamento de etapas internas.
- Validar visualmente cada US antes de avançar.

### Parallel Opportunities

- T025, T026, T027 (Polish): editam arquivos diferentes — podem ser feitos em paralelo.
- US2, US3, US4 podem ser entregues em paralelo por desenvolvedores diferentes desde que coordenem em torno de `dashboard.html` (ou trabalhem em branches/commits sequenciais — recomendado em projetos single-file como este).
- Setup tasks T001–T006 são sequenciais por editar o mesmo arquivo, sem [P].
- Foundational tasks T007–T011 idem.

---

## Parallel Example: Phase 7 (Polish)

```bash
# Atualizar links de navegação em paralelo (3 arquivos distintos):
Task: "Atualizar nav inferior em src/frontend/pages/students.html"
Task: "Atualizar nav inferior em src/frontend/pages/training.html"
Task: "Atualizar nav inferior em src/frontend/pages/games.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (T001–T006).
2. Completar Phase 2: Foundational (T007–T011) — **CRÍTICO**: aba Treinos deve estar 100% preservada antes de avançar.
3. Completar Phase 3: User Story 1 (T012–T019).
4. **PARAR e VALIDAR**: roteiro do quickstart seções A, B, C, J — toggle, busca, seleção e cards de treinos. Aba Treinos sem regressão.
5. Demo / deploy se desejado.

### Incremental Delivery

1. Setup + Foundational → fundação pronta (aba Treinos preservada).
2. US1 → MVP da aba Alunos (cards de treinos).
3. US2 → adiciona gráficos de treino.
4. US3 → adiciona resumo e gráfico de jogos.
5. US4 → adiciona histórico de jogos.
6. Polish → atualiza navegação, deleta arquivo antigo, valida quickstart inteiro.

### Single-Developer Strategy

- Tudo sequencial: T001 → T029.
- Após cada Phase: smoke-check no browser (página abre, aba Treinos não quebrou).
- Após cada US: passar pelos cenários da US no quickstart antes de seguir.

---

## Notes

- [P] tasks = arquivos distintos, sem dependências.
- Migração T010 deve ser **literal** — qualquer "melhoria" oportunista na lógica da aba Treinos é fora de escopo desta feature e adiciona risco de regressão.
- O `ensureMockData()` herdado da feature 011 continua sendo chamado por `init()` (T011) — comportamento da aba **Treinos** preservado conforme R15. A aba **Alunos** NÃO chama nada equivalente (Clarification Q2).
- Toda manipulação de `state` é leitura. Nenhuma das funções desta feature escreve em `state.alunos`, `state.chamadas` ou `state.jogos` (FR-018).
- Avatar do aluno usa apenas iniciais (R7); não há campo `fotoUrl` introduzido.
- Empate no histórico de jogos é resolvido por ordem original do array (estável e determinístico) — implementação simples via `slice().sort((a, b) => b.data.localeCompare(a.data))` que é estável em V8/SpiderMonkey/Chromium modernos.
- Commit após cada Phase ou checkpoint para facilitar rollback caso algo regrida.
