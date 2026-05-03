# Tasks: Dashboard de Treinos

**Input**: Design documents from `/specs/011-training-dashboard/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação por inspeção visual manual e fluxo funcional (ver [quickstart.md](quickstart.md), 18 passos).

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
    ├── dashboard-treinos.html       ← NOVO (única página com lógica)
    ├── training.html                ← apenas nav inferior
    ├── students.html                ← apenas nav inferior
    ├── games.html                   ← apenas nav inferior
    ├── student-eval.html            ← sem alteração
    └── login.html                   ← sem alteração
```

---

## Phase 1: Setup (Estrutura HTML da Nova Página)

**Purpose**: Criar o arquivo da página com o esqueleto HTML, dependências externas (Tailwind CDN, Chart.js CDN, `imperial.css`) e os contêineres vazios de cada bloco. Nenhum JavaScript funcional ainda.

- [X] T001 Criar arquivo `src/frontend/pages/dashboard-treinos.html` com `<!DOCTYPE html>`, `<html lang="pt-BR">` e `<head>` contendo: `<meta charset="UTF-8">`, viewport, `<title>Imperial Soccer — Dashboard de Treinos</title>`, `<script src="https://cdn.tailwindcss.com"></script>`, `<link rel="stylesheet" href="../css/imperial.css">`, `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` (carregado fora de módulo para escopo global), e `<script>` com `tailwind.config` idêntico a `training.html` (paleta `imperial`)
- [X] T002 Adicionar `<body class="bg-imperial-bg text-imperial-text min-h-screen flex flex-col pb-16">` em `src/frontend/pages/dashboard-treinos.html` com `<header>` verde idêntico ao de `training.html` (logo SVG + título "Dashboard de Treinos" + subtítulo "Volume e conteúdo trabalhado por categoria") e `<main class="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">` vazio (será preenchido nas próximas tarefas)
- [X] T003 Adicionar dentro de `<main>` em `src/frontend/pages/dashboard-treinos.html` os contêineres vazios em ordem: `<section id="secaoCategoria" class="bg-imperial-card rounded-xl border border-imperial-border p-3 shadow-sm"><label class="block text-xs text-imperial-text-muted mb-2">Categoria</label><div id="seletorCategoria" class="flex flex-wrap gap-2" role="group" aria-label="Selecionar categoria"></div></section>`, `<section id="cardsResumo" class="grid grid-cols-2 sm:grid-cols-4 gap-3"></section>`, `<section class="bg-imperial-card rounded-xl border border-imperial-border p-4 shadow-sm"><h3 class="text-sm font-semibold mb-1">Volume por momento do jogo</h3><p class="text-xs text-imperial-text-muted mb-3">Quantas sessões trabalham cada momento</p><div class="relative h-48"><canvas id="canvasVolume"></canvas><p id="emptyVolume" class="hidden absolute inset-0 flex items-center justify-center text-xs text-imperial-text-muted">Sem dados de momentos para esta categoria.</p></div></section>`, `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">` envolvendo `<section><h3>Distribuição por categoria de conteúdo</h3>… canvas#canvasDistribuicao + p#emptyDistribuicao …</section>` e `<section><h3>Princípios e fundamentos mais trabalhados</h3><p class="text-xs">Top 8 itens</p><ul id="listaTopPrincipios" class="space-y-2"></ul></section>` `</div>`, e `<section class="bg-imperial-card rounded-xl border border-imperial-border p-4 shadow-sm"><h3 class="text-sm font-semibold mb-3">Sessões recentes</h3><ul id="listaSessoesRecentes" class="divide-y divide-imperial-border" role="list" aria-live="polite"></ul></section>`
- [X] T004 Adicionar nav inferior em `src/frontend/pages/dashboard-treinos.html` — `<nav class="fixed bottom-0 left-0 right-0 bg-imperial-card border-t border-imperial-border flex h-16 z-40">` com 4 abas (`flex-1` em cada `<a>`): Alunos (`students.html`, ícone usuários), Treino (`training.html`, ícone calendário), Jogos (`games.html`, ícone bola), Dashboard (`dashboard-treinos.html`, ícone gráfico de barras `<path d="M9 19V6m0 13l-3-3m3 3l3-3M15 5v13m0-13l-3 3m3-3l3 3"/>` ou similar) — esta última aba marcada como ativa (`text-imperial-green font-semibold border-t-2 border-imperial-green` + `aria-current="page"`)

---

## Phase 2: Foundational (Constantes, Estado, Helpers, Mock e Compute)

**Purpose**: Toda a lógica não-visual da página. Esta fase BLOQUEIA todas as user stories.

**⚠️ CRÍTICO**: Sem o agregador `computeDashboardData` e o mock injetado, nenhum render produz dados.

- [X] T005 Adicionar bloco `<script type="module">` ao final de `<body>` em `src/frontend/pages/dashboard-treinos.html` declarando todas as constantes do domínio: `const CATEGORIAS = ['Sub09','Sub10','Sub11','Sub12','Sub13','Sub14']`; `const CATEGORIAS_LABELS = { Sub09:'Sub 09', Sub10:'Sub 10', Sub11:'Sub 11', Sub12:'Sub 12', Sub13:'Sub 13', Sub14:'Sub 14' }`; `const MOMENTOS = [{ id:'org_ofensiva',label:'Org. Ofensiva' },{ id:'org_defensiva',label:'Org. Defensiva' },{ id:'trans_ofensiva',label:'Trans. Ofensiva' },{ id:'trans_defensiva',label:'Trans. Defensiva' }]`; `const PRINCIPIOS_GRUPOS = [...]` (copiar verbatim de `training.html` linhas ~236–273, incluindo o campo `filtro` de cada grupo)
- [X] T006 Adicionar constantes específicas do dashboard no mesmo `<script>` em `src/frontend/pages/dashboard-treinos.html` — `const STATE_KEY = 'imperialState'`; `const DURACAO_TREINO_MIN = 60`; `const TOP_PRINCIPIOS_LIMITE = 8`; `const SESSOES_RECENTES_LIMITE = 6`; `const FAMILIAS_LABEL = { defensivo:'Princípios Táticos Defensivos', ofensivo:'Princípios Táticos Ofensivos', sempre:'Fundamentos Técnicos' }`; `const FAMILIAS_COR = { defensivo:'#dc2626', ofensivo:'#16a34a', sempre:'#f59e0b' }`; `const MOMENTOS_COR = { org_ofensiva:'#16a34a', org_defensiva:'#dc2626', trans_ofensiva:'#f59e0b', trans_defensiva:'#6b7280' }`
- [X] T007 Implementar `loadState()` e `saveState()` em `src/frontend/pages/dashboard-treinos.html` — idênticas a `training.html` linhas ~278–292: lê/escreve em `sessionStorage` com a chave `STATE_KEY`; default `{ alunos:[], avaliacoes:[], chamadas:[], jogos:[] }`; em seguida declarar variáveis de estado da página: `const state = loadState()`, `let categoriaSelecionada = 'Sub09'`, `let chartVolume = null`, `let chartDistribuicao = null`
- [X] T008 Implementar funções utilitárias em `src/frontend/pages/dashboard-treinos.html` — `formatDate(iso)` (idêntica a `training.html` ~300–304: ISO → `DD/MM/AAAA`), `escapeHtml(str)` (idêntica a `training.html` ~306–308), `getMomentoLabel(id)` (busca em `MOMENTOS` e retorna `label` ou `'—'`), `getPrincipioInfo(id)` (varre `PRINCIPIOS_GRUPOS`, retorna `{ label, filtro }` ou `null`)
- [X] T009 Implementar `MOCK_CHAMADAS_DASHBOARD` e `ensureMockData()` em `src/frontend/pages/dashboard-treinos.html` — array com ≈30 chamadas distribuídas conforme [data-model.md](data-model.md#mock-data--mock_chamadas_dashboard): Sub09 com 6 chamadas (espelha protótipo: Passe×3, Penetração×2, Contenção×2, demais ×1; presença ≈88%; momentos majoritariamente ofensivos), Sub10 com 5, Sub11 com 5, Sub12 com 5, Sub13 com 5, Sub14 com 4; cada item tem `id` (gerado em runtime), `data` ISO, `categoria`, `registros[]` (3–8 alunos com mix presente/falta), `momentos[]` (1–2 IDs válidos), `principiosFundamentos[]` (2–4 IDs válidos); função `ensureMockData()`: `if (state.chamadas.length === 0) { state.chamadas = MOCK_CHAMADAS_DASHBOARD.map(c => ({ ...c, id: crypto.randomUUID() })); saveState(); }`
- [X] T010 Implementar `computeDashboardData(categoria)` em `src/frontend/pages/dashboard-treinos.html` — função pura que retorna o objeto `DashboardData` conforme [data-model.md](data-model.md#estrutura-computada-dashboarddata): filtra `state.chamadas` pela `categoria`; calcula `totalTreinos`, `totalMinutos = totalTreinos * DURACAO_TREINO_MIN`, `presencaMedia` (média ponderada por sessão de `presentes/total`, ignorando chamadas com `registros.length === 0`, arredondada para inteiro 0–100, `0` se nenhuma elegível), `totalItens` (soma de `chamada.principiosFundamentos.length`); monta `volumePorMomento` (4 chaves, contagem de chamadas que contêm cada momento); monta `distribuicaoFamilia` (3 chaves: `defensivo`, `ofensivo`, `sempre` — somando ocorrências de itens cuja `filtro` corresponde); monta `topPrincipios` (contagem por ID, mapeia para `{id,label,count}`, ordena por `count DESC` então `label ASC`, `slice(0, TOP_PRINCIPIOS_LIMITE)`); monta `sessoesRecentes` (cópia ordenada por `data DESC` via `localeCompare`, top `SESSOES_RECENTES_LIMITE`, cada item: `{id, data, momentoLabel, fundamentosLabels, presentes, total}` — `momentoLabel` é o label do **primeiro** momento na ordem de `MOMENTOS` que aparece em `chamada.momentos`, ou `'—'` se vazio; `fundamentosLabels` mapeia IDs via `getPrincipioInfo`; `presentes` conta `registros.filter(r => r.status === 'presente').length`; `total = registros.length`)
- [X] T011 Implementar `refresh()` e `init()` em `src/frontend/pages/dashboard-treinos.html` — `refresh()`: chama `computeDashboardData(categoriaSelecionada)` uma vez e passa o resultado para `renderSummaryCards`, `renderVolumeChart`, `renderDistribuicaoChart`, `renderTopPrincipios`, `renderSessoesRecentes` (placeholders por enquanto); `init()`: `ensureMockData()` → `renderCategorySelector()` → `selectCategoria(categoriaSelecionada)` (que chama `refresh`); registrar `document.addEventListener('DOMContentLoaded', init)`; declarar stubs vazios das funções de render para evitar ReferenceError

**Checkpoint**: Estrutura, dados e pipeline de cálculo prontos. Página carrega sem erros (mas vazia).

---

## Phase 3: User Story 1 — Visão Consolidada por Categoria (Priority: P1) 🎯 MVP

**Goal**: Professor abre o dashboard, escolhe uma categoria e vê instantaneamente os 4 cards de resumo daquela categoria.

**Independent Test**: Abrir `dashboard-treinos.html` → seletor mostra 6 categorias com Sub 09 selecionada → 4 cards exibem números coerentes (≈ 6 / 360 / 88% / 18) → tocar em outra categoria → cards atualizam sem reload e o destaque muda.

### Implementation for User Story 1

- [X] T012 [US1] Implementar `renderCategorySelector()` em `src/frontend/pages/dashboard-treinos.html` — para cada `cat` em `CATEGORIAS` cria `<button type="button" data-cat="${cat}" class="..." aria-pressed="${cat === categoriaSelecionada}">${CATEGORIAS_LABELS[cat]}</button>`; classes: padrão `px-4 py-1.5 rounded-full text-sm font-medium border border-imperial-border bg-imperial-card text-imperial-text hover:border-imperial-green focus:outline-none focus:ring-2 focus:ring-imperial-green`; quando selecionado adicionar `bg-imperial-green text-white border-imperial-green`; insere todos no container `#seletorCategoria`; ao final, registra `addEventListener('click')` em delegação no `#seletorCategoria` que chama `selectCategoria(e.target.dataset.cat)` quando clicar em um botão
- [X] T013 [US1] Implementar `selectCategoria(cat)` em `src/frontend/pages/dashboard-treinos.html` — `if (!CATEGORIAS.includes(cat)) return`; `categoriaSelecionada = cat`; atualizar atributos visuais dos botões: para cada `<button>` em `#seletorCategoria`, atualizar `aria-pressed` e alternar as classes ativas/inativas; chamar `refresh()`
- [X] T014 [US1] Implementar `renderSummaryCards(data)` em `src/frontend/pages/dashboard-treinos.html` — limpa `#cardsResumo` e gera 4 cards no formato `<div class="bg-imperial-card rounded-xl border border-imperial-border px-3 py-3 shadow-sm"><div class="flex items-center gap-1.5 text-xs text-imperial-text-muted"><svg class="w-3.5 h-3.5" .../>${LABEL}</div><div class="text-2xl font-bold mt-1">${VALOR}</div></div>` com: (1) Treinos (ícone calendário, valor `data.totalTreinos`), (2) Minutos (ícone relógio, valor `data.totalMinutos`), (3) Presença média (ícone tendência, valor `${data.presencaMedia}%`), (4) Itens trabalhados (ícone lista, valor `data.totalItens`)
- [X] T015 [US1] Substituir o stub `renderSummaryCards` no `refresh()` pela implementação real e validar manualmente em `src/frontend/pages/dashboard-treinos.html` — abrir a página, confirmar que Sub 09 mostra os 4 valores próximos ao protótipo (6 / 360 / 88% / 18) e que clicar em outra categoria atualiza os 4 cards

**Checkpoint**: Dashboard MVP entregável: seletor funcional + 4 cards reativos. Demais blocos ainda exibem placeholders/vazios.

---

## Phase 4: User Story 2 — Volume por Momento do Jogo (Priority: P2)

**Goal**: Gráfico de barras mostra a distribuição das sessões pelos 4 momentos do jogo na categoria selecionada.

**Independent Test**: Em Sub 09 (mock) ver 4 barras com Org. Ofensiva como a maior; trocar para Sub 12 → as alturas redistribuem mantendo a ordem fixa Org.Of/Org.Def/Trans.Of/Trans.Def no eixo X.

### Implementation for User Story 2

- [X] T016 [US2] Implementar `renderVolumeChart(data)` em `src/frontend/pages/dashboard-treinos.html` — calcula `total = soma de Object.values(data.volumePorMomento)`; se `total === 0` exibe `#emptyVolume` (remove `hidden`) e chama `chartVolume?.destroy()` + `chartVolume = null` + return; senão oculta `#emptyVolume`, chama `chartVolume?.destroy()` antes de criar; `chartVolume = new Chart(document.getElementById('canvasVolume'), { type:'bar', data:{ labels: MOMENTOS.map(m => m.label), datasets:[{ data: MOMENTOS.map(m => data.volumePorMomento[m.id] || 0), backgroundColor: MOMENTOS.map(m => MOMENTOS_COR[m.id]), borderRadius: 6, barThickness: 28 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, tooltip:{ enabled:true } }, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1, precision:0 } }, x:{ grid:{ display:false } } } })`
- [X] T017 [US2] Substituir o stub `renderVolumeChart` em `refresh()` pela implementação real em `src/frontend/pages/dashboard-treinos.html` e validar — trocar entre Sub 09 e Sub 14 e confirmar que o gráfico se redesenha (sem canvases empilhados) e a ordem das colunas é constante

**Checkpoint**: Bar chart funcional e reativo. US1 + US2 entregáveis em conjunto.

---

## Phase 5: User Story 3 — Distribuição Tático × Fundamentos (Priority: P2)

**Goal**: Gráfico de rosca mostra a proporção entre Princípios Táticos Defensivos, Princípios Táticos Ofensivos e Fundamentos Técnicos.

**Independent Test**: Em Sub 09 ver 3 fatias com legenda; tooltip ao passar sobre fatia mostra família + contagem.

### Implementation for User Story 3

- [X] T018 [US3] Implementar `renderDistribuicaoChart(data)` em `src/frontend/pages/dashboard-treinos.html` — calcula `total = data.distribuicaoFamilia.defensivo + data.distribuicaoFamilia.ofensivo + data.distribuicaoFamilia.sempre`; se `total === 0` exibe `#emptyDistribuicao`, destrói chart e return; senão oculta empty, destrói chart anterior; `chartDistribuicao = new Chart(document.getElementById('canvasDistribuicao'), { type:'doughnut', data:{ labels:[FAMILIAS_LABEL.defensivo, FAMILIAS_LABEL.ofensivo, FAMILIAS_LABEL.sempre], datasets:[{ data:[data.distribuicaoFamilia.defensivo, data.distribuicaoFamilia.ofensivo, data.distribuicaoFamilia.sempre], backgroundColor:[FAMILIAS_COR.defensivo, FAMILIAS_COR.ofensivo, FAMILIAS_COR.sempre], borderWidth:0 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{ size:11 } } }, tooltip:{ enabled:true } } } })`
- [X] T019 [US3] Substituir o stub `renderDistribuicaoChart` em `refresh()` pela implementação real em `src/frontend/pages/dashboard-treinos.html` e validar — trocar de Sub 09 para Sub 14 e confirmar que as fatias atualizam; testar categoria sem itens trabalhados (manualmente injetar uma chamada com `principiosFundamentos: []`) → ver mensagem "Sem itens trabalhados…"

**Checkpoint**: Doughnut chart funcional. Distribuição visível.

---

## Phase 6: User Story 4 — Top 8 Princípios e Fundamentos (Priority: P2)

**Goal**: Lista mostra os 8 princípios/fundamentos mais trabalhados na categoria, em ordem decrescente, com barras horizontais proporcionais.

**Independent Test**: Em Sub 09 (mock) ver Passe (3), Penetração (2), Contenção (2) no topo; em uma categoria com poucos itens ver apenas N linhas (sem placeholders); empates ordenados alfabeticamente.

### Implementation for User Story 4

- [X] T020 [US4] Implementar `renderTopPrincipios(data)` em `src/frontend/pages/dashboard-treinos.html` — limpa `#listaTopPrincipios`; se `data.topPrincipios.length === 0` insere `<li class="text-xs text-imperial-text-muted py-2">Nenhum princípio ou fundamento registrado.</li>` e return; senão calcula `maxCount = Math.max(...data.topPrincipios.map(p => p.count))`; para cada `p` gera `<li class="flex items-center gap-3 text-sm"><span class="flex-1 truncate">${escapeHtml(p.label)}</span><div class="flex-1 h-2 bg-imperial-green-light rounded-full overflow-hidden"><div class="h-full bg-imperial-green rounded-full" style="width: ${(p.count/maxCount)*100}%"></div></div><span class="w-6 text-right font-semibold text-imperial-green">${p.count}</span></li>`
- [X] T021 [US4] Substituir o stub `renderTopPrincipios` em `refresh()` pela implementação real em `src/frontend/pages/dashboard-treinos.html` e validar — trocar entre categorias; verificar empate determinístico (alfabético) recarregando a página algumas vezes

**Checkpoint**: Top 8 funcional e estável.

---

## Phase 7: User Story 5 — Sessões Recentes (Priority: P3)

**Goal**: Lista exibe até as 6 sessões mais recentes da categoria, com data, momento, fundamentos e razão de presentes.

**Independent Test**: Em Sub 09 ver 6 linhas ordenadas por data decrescente; cada linha exibe `DD/MM/AAAA — Momento`, lista de fundamentos abaixo, e `Presentes X/Y` à direita.

### Implementation for User Story 5

- [X] T022 [US5] Implementar `renderSessoesRecentes(data)` em `src/frontend/pages/dashboard-treinos.html` — limpa `#listaSessoesRecentes`; se `data.sessoesRecentes.length === 0` insere `<li class="py-3 text-xs text-imperial-text-muted">Nenhuma sessão registrada para esta categoria.</li>` e return; senão para cada `s` gera `<li class="py-3 flex items-start justify-between gap-3" role="listitem"><div class="flex-1 min-w-0"><div class="text-sm font-semibold">${formatDate(s.data)} — ${escapeHtml(s.momentoLabel)}</div><div class="text-xs text-imperial-text-muted mt-0.5 truncate">${s.fundamentosLabels.length ? s.fundamentosLabels.map(escapeHtml).join(' • ') : '—'}</div></div><div class="text-right shrink-0"><div class="text-xs text-imperial-text-muted">Presentes</div><div class="text-sm font-bold ${s.total === 0 ? 'text-imperial-text-muted' : 'text-imperial-green'}">${s.total === 0 ? '—/—' : `${s.presentes}/${s.total}`}</div></div></li>`
- [X] T023 [US5] Substituir o stub `renderSessoesRecentes` em `refresh()` pela implementação real em `src/frontend/pages/dashboard-treinos.html` e validar — trocar entre categorias e confirmar ordenação cronológica decrescente

**Checkpoint**: Lista de sessões recentes funcional. Todas as 5 user stories entregues.

---

## Phase 8: Polish & Cross-Cutting (Navegação, Mobile, Regressão)

**Purpose**: Adicionar a 4ª aba "Dashboard" no nav inferior das páginas existentes e validar o fluxo completo.

- [X] T024 [P] Adicionar 4ª aba "Dashboard" no nav inferior de `src/frontend/pages/training.html` — localizar `<nav class="fixed bottom-0 left-0 right-0 bg-imperial-card border-t border-imperial-border flex h-16 z-40">` (~linha 186); inserir antes de `</nav>` o `<a href="dashboard-treinos.html" class="flex-1 flex flex-col items-center justify-center gap-1 text-imperial-text-muted hover:text-imperial-green transition-colors" aria-label="Dashboard"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6m0 13l-3-3m3 3l3-3M15 5v13m0-13l-3 3m3-3l3 3"/></svg><span class="text-xs font-medium">Dashboard</span></a>`; confirmar que as 4 abas continuam com `flex-1` (distribuição igual)
- [X] T025 [P] Adicionar 4ª aba "Dashboard" no nav inferior de `src/frontend/pages/students.html` — mesma alteração mecânica do T024 (mesmo HTML do `<a>`); manter as outras 3 abas inalteradas
- [X] T026 [P] Adicionar 4ª aba "Dashboard" no nav inferior de `src/frontend/pages/games.html` — mesma alteração mecânica do T024
- [ ] T027 Validar responsividade de `src/frontend/pages/dashboard-treinos.html` em DevTools mobile (iPhone SE 375 × 667) — confirmar: seletor de categoria faz wrap (3+3 botões); cards ficam em grid 2×2; canvases dos charts não estouram a largura; lista de sessões recentes mantém presentes alinhado à direita; nav inferior 4 abas com `flex-1` distribui-se uniformemente
- [ ] T028 Validar zero regressões — abrir `students.html`, `training.html` e `games.html`, navegar entre as 4 abas pelo nav inferior, confirmar que cada página continua funcional (lista de alunos, CRUD de treinos, CRUD de jogos) e que a aba "Dashboard" leva para a página nova
- [ ] T029 Executar fluxo completo de validação conforme `specs/011-training-dashboard/quickstart.md` — 18 passos: carga inicial → seletor + cards (US1) → bar chart (US2) → doughnut (US3) → top 8 (US4) → sessões recentes (US5) → estado vazio (limpar `sessionStorage` e recarregar; injetar chamada com `registros:[]` e `principiosFundamentos:[]` para ver mensagens vazias)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente (T001–T004)
- **Foundational (Phase 2)**: Depende de Phase 1 — toda lógica não-visual (T005–T011) bloqueia user stories
- **US1 (Phase 3)**: Depende de Foundational — seletor + cards (T012–T015)
- **US2 (Phase 4)**: Depende de US1 (precisa do `refresh()` ativo e do seletor) — bar chart (T016–T017)
- **US3 (Phase 5)**: Depende de US1 — doughnut (T018–T019); independente de US2
- **US4 (Phase 6)**: Depende de US1 — top 8 (T020–T021); independente de US2 e US3
- **US5 (Phase 7)**: Depende de US1 — sessões recentes (T022–T023); independente das demais
- **Polish (Phase 8)**: T024–T026 podem rodar em paralelo (arquivos distintos); T027–T029 dependem de todas as user stories prontas

### User Story Dependencies

- **US1 (P1)**: Depende somente de Foundational
- **US2 (P2)**: Depende de US1 (`refresh()` precisa estar ativo); independente de US3/US4/US5
- **US3 (P2)**: Depende de US1; independente de US2/US4/US5
- **US4 (P2)**: Depende de US1; independente de US2/US3/US5
- **US5 (P3)**: Depende de US1; independente de US2/US3/US4

### Within Each User Story

- A função render é implementada antes de ser plugada no `refresh()` real
- Validação manual ocorre logo após cada substituição de stub

### Notas sobre Paralelismo

- **Dentro de uma única dev**: tarefas de US2/US3/US4/US5 afetam o mesmo arquivo (`dashboard-treinos.html`); execução sequencial em série após US1.
- **Múltiplos devs**: depois de Phase 2 + US1, US2/US3/US4/US5 são pequenas o suficiente para serem feitas em sequência por uma pessoa, ou divididas se houver disputa de merge no `dashboard-treinos.html`.
- **Polish T024–T026**: 3 arquivos distintos → genuinamente paralelas (`[P]`).

---

## Parallel Example: Phase 8 (Nav inferior)

```bash
# Adicionar a aba "Dashboard" simultaneamente nas 3 páginas existentes:
Task: "Adicionar 4ª aba 'Dashboard' no nav inferior de src/frontend/pages/training.html"
Task: "Adicionar 4ª aba 'Dashboard' no nav inferior de src/frontend/pages/students.html"
Task: "Adicionar 4ª aba 'Dashboard' no nav inferior de src/frontend/pages/games.html"
```

---

## Implementation Strategy

### MVP First (US1)

1. Concluir Phase 1: Setup (T001–T004) — esqueleto HTML pronto
2. Concluir Phase 2: Foundational (T005–T011) — lógica e mock prontos
3. Concluir Phase 3: US1 (T012–T015) — seletor + cards funcionais
4. **PARAR e VALIDAR**: usuário consegue ver os 4 cards reativos por categoria → MVP entregável

### Incremental Delivery

1. Setup + Foundational → estrutura pronta (página carrega vazia, sem erros)
2. US1 → cards + seletor → **Demo MVP**
3. US2 → bar chart → **Demo com gráfico de volume**
4. US3 → doughnut → **Demo com distribuição**
5. US4 → top 8 → **Demo com ranking**
6. US5 → sessões recentes → **Demo com histórico**
7. Polish (nav + regressão + responsividade) → **Entrega final**

### Single-Dev Strategy

Como todas as render functions vivem no mesmo arquivo, recomenda-se executar Phase 3–7 em ordem priorizada (US1 → US2 → US3 → US4 → US5), commitando após cada phase. Phase 8 (T024–T026) pode ser feita em qualquer ponto após Phase 1, mas naturalmente cabe ao final junto com a validação de regressão.

---

## Notes

- **Único arquivo novo**: `src/frontend/pages/dashboard-treinos.html` — concentra toda a lógica
- **3 arquivos com alteração mínima**: `training.html`, `students.html`, `games.html` — apenas 1 `<a>` no nav inferior
- **Sem alteração de schema**: `state.chamadas[]` é consumido em modo leitura
- **Mock idempotente**: `ensureMockData()` só injeta se `state.chamadas` estiver vazio; respeita dados gravados pelo usuário
- **Chart.js destruir antes de recriar**: evita canvases empilhados ao trocar de categoria
- **Empate alfabético no top 8**: garante renderização determinística entre reloads
- **Sem persistência de seleção**: ao recarregar a página, default volta para Sub 09
- **Backward-compat**: chamadas antigas sem `momentos`/`principiosFundamentos` (treinos pré-feature 009) são tratadas como arrays vazios pelo compute
- Commitar após cada phase concluída
