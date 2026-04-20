# Tasks: Listagem e CRUD de Treinos com Filtro de Fundamentos

**Input**: Design documents from `/specs/010-training-crud-list/`
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
│   └── imperial.css              ← sem alteração
└── pages/
    ├── students.html             ← sem alteração
    ├── student-eval.html         ← sem alteração
    ├── training.html             ← REESTRUTURADA (único arquivo afetado)
    ├── games.html                ← sem alteração (referência de padrão)
    └── login.html                ← sem alteração
```

---

## Phase 1: Setup (Constantes e Infraestrutura)

**Purpose**: Adicionar constante de classificação de momentos e preparar a reestruturação HTML para o padrão lista + formulário.

- [ ] T001 Adicionar constante `MOMENTOS_TIPO` em `src/frontend/pages/training.html` — objeto mapa `{ org_ofensiva: 'ofensivo', org_defensiva: 'defensivo', trans_ofensiva: 'ofensivo', trans_defensiva: 'defensivo' }`; posicionar logo após a constante `MOMENTOS_ICONS`
- [ ] T002 Adicionar campo `filtro` a cada grupo em `PRINCIPIOS_GRUPOS` em `src/frontend/pages/training.html` — grupo "Princípios Táticos Defensivos" recebe `filtro: 'defensivo'`, grupo "Princípios Táticos Ofensivos" recebe `filtro: 'ofensivo'`, grupo "Fundamentos Técnicos" recebe `filtro: 'sempre'`
- [ ] T003 Implementar função helper `getGruposVisiveis()` em `src/frontend/pages/training.html` — retorna um Set de tipos visíveis: se algum momento selecionado em `momentosSelecionados` tem `MOMENTOS_TIPO[id] === 'ofensivo'` → inclui `'ofensivo'`; se algum tem `'defensivo'` → inclui `'defensivo'`; sempre inclui `'sempre'`; posicionar junto às funções de especificações
- [ ] T004 Implementar função helper `getLabelPrincipio(id)` em `src/frontend/pages/training.html` — dado um ID de princípio/fundamento, busca o label correspondente varrendo todos os itens de `PRINCIPIOS_GRUPOS`; retorna o label ou o próprio ID como fallback

---

## Phase 2: Foundational (Reestruturação HTML)

**Purpose**: Transformar a estrutura HTML de `training.html` de formulário direto para o padrão lista + formulário. Esta fase BLOQUEIA todas as user stories.

**⚠️ CRÍTICO**: A reestruturação HTML é pré-requisito para todo o resto.

- [ ] T005 Reestruturar o HTML de `<main>` em `src/frontend/pages/training.html` — substituir todo o conteúdo dentro de `<main>` por duas seções alternáveis: (1) `<section id="secaoLista">` com header contendo `<h2 class="text-lg font-bold text-imperial-text">Treinos Realizados</h2>` e botão `<button id="btnNovoTreino" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-imperial-green hover:opacity-90 text-white text-sm font-semibold shadow-md">` com ícone "+" e label "Novo Treino", e container `<div id="listaTreinos" class="space-y-3" role="list" aria-live="polite">`; (2) `<section id="secaoFormTreino" class="hidden">` com título dinâmico `<h2 id="tituloFormTreino" class="text-lg font-bold text-imperial-text mb-4">`, formulário com: card de data (`<input type="date" id="inputDataTreino">` + erro), card de categoria (`<select id="selectCategoriaTreino">` populado com CATEGORIAS + erro), `<div id="chamadaContainer" class="hidden">` (accordion com header + conteúdo: controles globais, painel resumo, lista alunos), `<section id="secaoEspecificacoes" class="hidden">` (momentos grid 2×2 + princípios/fundamentos com contador), e botões Salvar/Cancelar
- [ ] T006 Declarar variáveis de estado da UI em `src/frontend/pages/training.html` — `let treinoEditando = null` (null = modo criação, objeto = edição); remover `categoriaAtiva` (agora vem do select); manter `chamadaAtual`, `momentosSelecionados`, `principiosSelecionados`
- [ ] T007 Atualizar `loadState()` e funções de domínio em `src/frontend/pages/training.html` — adicionar `deleteTreino(id)`: `state.chamadas = state.chamadas.filter(c => c.id !== id); saveState();`; manter `findChamada`, `criarChamada`, `getOrCreateChamada`, `salvarChamada` existentes; atualizar `salvarChamada` para também copiar `momentosSelecionados` e `principiosSelecionados` para a chamada antes de persistir

**Checkpoint**: Estrutura HTML pronta com duas seções alternáveis. Lógica de domínio completa.

---

## Phase 3: User Story 1 — Consultar Lista de Treinos (Priority: P1)

**Goal**: Professor vê lista de treinos em ordem decrescente de data com data, categoria, presentes e princípios/fundamentos.

**Independent Test**: Com 3 treinos em datas diferentes, abrir tela → lista exibe na ordem correta com todos os dados.

### Implementation for User Story 1

- [ ] T008 [US1] Implementar `renderListaTreinos()` em `src/frontend/pages/training.html` — mostra `#secaoLista`, oculta `#secaoFormTreino`; ordena cópia de `state.chamadas` por `data` decrescente (`b.data.localeCompare(a.data)`); se vazio: exibe `<div class="py-14 text-center text-imperial-text-muted text-sm">Nenhum treino registrado ainda.</div>`; caso contrário gera para cada chamada um card `<div class="bg-imperial-card rounded-xl px-4 py-3 border border-imperial-border shadow-sm" role="listitem">` com: linha 1 `<div class="flex items-center justify-between"><div class="font-semibold text-sm">${formatDate(c.data)}</div><span class="px-2 py-0.5 rounded-full bg-imperial-green-light text-imperial-green border border-imperial-green text-xs">${CATEGORIAS_LABELS[c.categoria]}</span></div>`, linha 2 `<div class="text-xs text-imperial-text-muted mt-1">${presentes} presentes de ${total} alunos</div>`, linha 3 chips dos princípios/fundamentos (usando `getLabelPrincipio` para cada ID em `c.principiosFundamentos`, max 5 exibidos + "+N" se houver mais), linha 4 botões "Editar" e "Excluir" com `data-treino-id="${c.id}"`
- [ ] T009 [US1] Ligar eventos da lista em `src/frontend/pages/training.html` — `#btnNovoTreino` → `renderFormTreino(null)`; `.btn-editar-treino` via delegação em `#listaTreinos` → `renderFormTreino(state.chamadas.find(c => c.id === id))`; `.btn-excluir-treino` via delegação em `#listaTreinos` → handler de exclusão (preparado para US4)
- [ ] T010 [US1] Chamar `renderListaTreinos()` no boot em `src/frontend/pages/training.html` — substituir o boot atual (que auto-selecionava primeira aba) por simplesmente chamar `renderListaTreinos()`

**Checkpoint**: Lista de treinos funcional com dados corretos e botões de ação. US1 entregável.

---

## Phase 4: User Story 2 — Cadastrar Novo Treino com Filtro (Priority: P1) 🎯 MVP

**Goal**: Professor cria treino com data, categoria, chamada e especificações. Princípios são filtrados por momento selecionado.

**Independent Test**: Criar treino, selecionar "Org. Ofensiva" → apenas ofensivos + técnicos visíveis. Selecionar também "Org. Defensiva" → ambos visíveis. Desmarcar defensivo → princípios defensivos auto-desmarcados. Salvar → treino na lista.

### Implementation for User Story 2

- [ ] T011 [US2] Implementar `renderFormTreino(chamada)` em `src/frontend/pages/training.html` — oculta `#secaoLista`, mostra `#secaoFormTreino`; se `chamada` é null: `treinoEditando = null`, limpa campos, `momentosSelecionados = []`, `principiosSelecionados = []`, título "Novo Treino", `inputDataTreino.value = todayISO()`; se `chamada` é objeto: `treinoEditando = chamada`, preenche `inputDataTreino` e `selectCategoriaTreino` com dados, `momentosSelecionados = [...chamada.momentos]`, `principiosSelecionados = [...chamada.principiosFundamentos]`, título "Editar Treino"; em ambos: ocultar `#chamadaContainer` e `#secaoEspecificacoes` inicialmente; se categoria já selecionada, chamar `carregarChamadaForm()`
- [ ] T012 [US2] Implementar `carregarChamadaForm()` em `src/frontend/pages/training.html` — lê `inputDataTreino.value` e `selectCategoriaTreino.value`; valida: se data vazia ou categoria vazia, ocultar chamada e especificações e return; se modo edição (`treinoEditando`), usa `treinoEditando` diretamente como `chamadaAtual`; se modo criação, chama `getOrCreateChamada(data, categoria)` para criar ou encontrar chamada existente; mostra `#chamadaContainer`; renderiza chamada (painel resumo, lista alunos, contadores); mostra `#secaoEspecificacoes`; chama `renderEspecificacoes()`; ligar listeners de `inputDataTreino` change e `selectCategoriaTreino` change para chamar `carregarChamadaForm()`
- [ ] T013 [US2] Modificar `renderPrincipios()` em `src/frontend/pages/training.html` para aplicar filtro — chamar `getGruposVisiveis()` para obter Set de tipos visíveis; para cada grupo em `PRINCIPIOS_GRUPOS`: se `grupo.filtro` não está no Set de visíveis, pular o grupo (não renderizar) E remover de `principiosSelecionados` todos os IDs pertencentes a esse grupo (auto-desmarcação); atualizar `#contadorPrincipios` com contagem atualizada após a limpeza; o resto do render (chips, listeners de toggle) permanece igual
- [ ] T014 [US2] Modificar `renderMomentos()` em `src/frontend/pages/training.html` — após toggle de um momento (adicionar/remover de `momentosSelecionados`), chamar `renderPrincipios()` (já existente) para que o filtro seja aplicado imediatamente; o resto do render permanece igual
- [ ] T015 [US2] Implementar handler de submit (salvar treino) em `src/frontend/pages/training.html` — ao clicar no botão "Salvar Treino": ler data de `#inputDataTreino` e categoria de `#selectCategoriaTreino`; validar: se data vazia → mostrar erro + return; se categoria vazia → mostrar erro + return; copiar `chamadaAtual.momentos = [...momentosSelecionados]` e `chamadaAtual.principiosFundamentos = [...principiosSelecionados]`; chamar `salvarChamada(chamadaAtual)`; chamar `renderListaTreinos()`; `showToast(treinoEditando ? 'Treino atualizado!' : 'Treino salvo com sucesso!')`
- [ ] T016 [US2] Ligar botão "Cancelar" do formulário em `src/frontend/pages/training.html` — ao clicar `#btnCancelarFormTreino`: `treinoEditando = null`, `chamadaAtual = null`, `momentosSelecionados = []`, `principiosSelecionados = []`, chamar `renderListaTreinos()`

**Checkpoint**: Criação de treino com filtro inteligente de princípios funcional. US1 + US2 = MVP entregável.

---

## Phase 5: User Story 3 — Editar Treino Registrado (Priority: P2)

**Goal**: Professor edita treino existente com formulário pré-preenchido.

**Independent Test**: Editar treino → formulário com dados corretos → alterar princípio → salvar → lista reflete alteração.

### Implementation for User Story 3

- [ ] T017 [US3] Verificar e ajustar `renderFormTreino(chamada)` para modo edição em `src/frontend/pages/training.html` — confirmar que: `inputDataTreino.value` recebe `chamada.data`, `selectCategoriaTreino.value` recebe `chamada.categoria` (e dispara `carregarChamadaForm`), `momentosSelecionados` e `principiosSelecionados` são cópias profundas, título exibe "Editar Treino", `treinoEditando` é setado corretamente; confirmar que no modo edição o campo de categoria e data devem ser read-only (disabled) para evitar inconsistências com a chamada carregada
- [ ] T018 [US3] Verificar que o submit do formulário em modo edição em `src/frontend/pages/training.html` chama `salvarChamada` com o ID correto — confirmar que `salvarChamada` com `chamada.data + chamada.categoria` existentes atualiza (não duplica); confirmar que `treinoEditando` é resetado após salvar

**Checkpoint**: Edição funcional. Dados preservados ao abrir, persistidos ao salvar.

---

## Phase 6: User Story 4 — Excluir Treino (Priority: P2)

**Goal**: Professor exclui treino com confirmação.

**Independent Test**: Clicar Excluir → confirmar → treino desaparece → toast de exclusão.

### Implementation for User Story 4

- [ ] T019 [US4] Implementar handler de exclusão em `src/frontend/pages/training.html` — ao clicar `.btn-excluir-treino` (via delegação em `#listaTreinos`): obter `id` do `data-treino-id`; `if (window.confirm('Excluir este treino? Esta ação não pode ser desfeita.'))` → `deleteTreino(id)` → `renderListaTreinos()` → `showToast('Treino excluído.', 'error')`

**Checkpoint**: CRUD completo funcional.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Validações, responsividade, edge cases e fluxo completo.

- [ ] T020 Garantir que treinos antigos (feature 009, sem `momentos`/`principiosFundamentos`) são exibidos corretamente na lista em `src/frontend/pages/training.html` — em `renderListaTreinos()`, tratar `c.principiosFundamentos` como `[]` se undefined; tratar `c.momentos` como `[]` se undefined; exibir "Nenhum" ou área vazia quando não há princípios
- [ ] T021 Popular `#selectCategoriaTreino` com opções de `CATEGORIAS` no boot em `src/frontend/pages/training.html` — `<option value="">Selecione a categoria</option>` + uma opção para cada categoria com `CATEGORIAS_LABELS[cat]`; executar ao inicializar o formulário
- [ ] T022 Implementar validação completa do formulário em `src/frontend/pages/training.html` — data vazia → erro inline + foco; categoria vazia → erro inline + foco; limpar erros ao iniciar validação; `inputDataTreino.max = todayISO()` no boot
- [ ] T023 Validar responsividade de `src/frontend/pages/training.html` em 375 px no DevTools — confirmar: lista de treinos sem overflow; chips de princípios na lista fazem wrap; grid 2×2 de momentos no formulário ok; accordion da chamada funcional; botões Salvar/Cancelar acessíveis
- [ ] T024 Executar fluxo completo de validação conforme `specs/010-training-crud-list/quickstart.md` — 22 passos: lista → novo treino → filtro de princípios → salvar → editar → excluir → verificar zero regressões

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente (T001–T004)
- **Foundational (Phase 2)**: Depende de Phase 1 — reestruturação HTML bloqueia tudo (T005–T007)
- **US1 (Phase 3)**: Depende de Foundational — lista de treinos (T008–T010)
- **US2 (Phase 4)**: Depende de US1 (formulário navega de/para lista) — cadastro + filtro (T011–T016)
- **US3 (Phase 5)**: Depende de US2 (edição reutiliza formulário) — T017–T018
- **US4 (Phase 6)**: Depende de US1 (exclusão na lista) — T019
- **Polish (Phase 7)**: Depende de todas as user stories — T020–T024

### User Story Dependencies

- **US1 (P1)**: Depende somente de Foundational
- **US2 (P1)**: Depende de US1 (precisa da lista para navegação)
- **US3 (P2)**: Depende de US2 (reutiliza renderFormTreino)
- **US4 (P2)**: Depende de US1 (handler na lista)

### Within Each User Story

- HTML structure antes de render functions
- Render functions antes de event listeners
- Event listeners antes de integração com fluxo existente

### Notas sobre Paralelismo

Todas as tarefas afetam o mesmo arquivo (`training.html`), portanto **não há oportunidade de paralelismo entre tarefas**. Execução necessariamente sequencial.

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Concluir Phase 1: Setup (T001–T004)
2. Concluir Phase 2: Foundational — reestruturação HTML (T005–T007)
3. Concluir Phase 3: US1 — Lista de treinos (T008–T010)
4. Concluir Phase 4: US2 — Cadastro com filtro (T011–T016)
5. **PARAR e VALIDAR**: Professor vê lista, cria treino com filtro inteligente ✓
6. MVP entregável

### Incremental Delivery

1. Setup + Foundational → estrutura pronta
2. US1 → lista funcional → **Demo visual**
3. US2 → cadastro + filtro → **Demo MVP**
4. US3 → edição → **Demo CRUD parcial**
5. US4 → exclusão → **Demo CRUD completo**
6. Polish → validações e responsividade → **Entrega final**

---

## Notes

- **Único arquivo modificado**: `src/frontend/pages/training.html` — reestruturação significativa
- **Sem alteração de esquema de dados**: `state.chamadas` já possui todos os campos necessários
- **Padrão visual**: seguir `games.html` como referência para o layout lista + formulário
- O `tailwind.config` em `training.html` já possui todos os tokens de cor necessários
- Ícones SVG dos momentos e constantes de princípios já existem (feature 009)
- **Backward-compat**: treinos antigos sem `momentos`/`principiosFundamentos` devem funcionar
- Commitar após cada phase concluída
