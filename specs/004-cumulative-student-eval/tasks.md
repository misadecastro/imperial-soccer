# Tasks: Avaliação Acumulativa do Aluno com Histórico e Gráfico

**Input**: Design documents from `/specs/004-cumulative-student-eval/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação manual via `quickstart.md`.

**Organization**: Tarefas agrupadas por user story para entrega incremental independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: User story da spec.md (US1–US4)
- Caminhos relativos à raiz do repositório: `frontend/pages/`

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Criar a estrutura base da nova página e preparar o sistema de estado compartilhado.

- [x] T001 Criar `frontend/pages/student-eval.html` com estrutura HTML base: `<!DOCTYPE html>`, `<head>` com Tailwind CDN + Chart.js CDN (`https://cdn.jsdelivr.net/npm/chart.js`), `tailwind.config` idêntico ao de `students.html` (mesmas cores imperial), `<body>` com header (logo + botão Voltar), área `<main>`, footer e `<script type="module">` vazio
- [x] T002 Em `frontend/pages/students.html`: adicionar função `saveState()` que serializa `state` para `sessionStorage` via `sessionStorage.setItem('imperialState', JSON.stringify(state))` e função `loadState()` que lê e parseia o estado do `sessionStorage` (retornando `{ alunos: [], avaliacoes: [] }` se não existir)
- [x] T003 Em `frontend/pages/students.html`: substituir a inicialização de `state` por `const state = loadState()` no início do script, garantindo que ao retornar da tela de avaliação o estado persistido seja restaurado

**Checkpoint**: `student-eval.html` abre no browser sem erros; `students.html` carrega e restaura estado do `sessionStorage` corretamente.

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Navegação funcional entre pages + leitura de estado em `student-eval.html` — bloqueia todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode começar antes desta fase estar completa.

- [x] T004 Em `frontend/pages/students.html`: alterar o listener do botão `.btn-avaliar` para, em vez de chamar `abrirModal()`, chamar `saveState()` e então navegar com `window.location.href = \`student-eval.html?alunoId=\${alunoId}\``
- [x] T005 Em `frontend/pages/student-eval.html`: no `<script type="module">`, implementar `loadState()` (lê `imperialState` do `sessionStorage`, retorna `{ alunos: [], avaliacoes: [] }` se nulo), `saveState()` (grava estado atual), e leitura do `alunoId` via `new URLSearchParams(window.location.search).get('alunoId')` — redirecionar para `students.html` se `alunoId` não encontrado
- [x] T006 Em `frontend/pages/student-eval.html`: implementar constantes reutilizadas de `students.html`: `NOTAS`, `CATEGORIAS_LABELS`, `ICONS`, `generateId()`, `formatDate()`, `escapeHtml()`, `showToast()`

**Checkpoint**: Clicar em "Avaliar" em qualquer aluno navega para `student-eval.html` sem erros no console; `alunoId` é lido corretamente da URL; "Voltar" (ainda sem função) não quebra a página.

---

## Phase 3: User Story 1 — Visualizar Tela de Avaliação do Aluno (Priority: P1) 🎯 MVP

**Goal**: Professor clica "Avaliar" e vê a tela de avaliação individual com nome do aluno, botão Voltar e lista de avaliações históricas (ou mensagem de vazia).

**Independent Test**: Com um aluno cadastrado e 2 avaliações registradas (via `sessionStorage` pré-populado ou fluxo normal), navegar para `student-eval.html?alunoId=<id>` e confirmar: nome do aluno no cabeçalho, lista com 2 registros exibindo data + Tático + Técnico + Mental, botão Voltar retorna para `students.html` com estado intacto.

### Implementation for User Story 1

- [x] T007 [US1] Em `frontend/pages/student-eval.html`: implementar cabeçalho da tela com nome do aluno em destaque (buscar em `state.alunos` pelo `alunoId`) e subtítulo com categoria — exibir em `<h1>` e `<p>` abaixo do header global
- [x] T008 [US1] Em `frontend/pages/student-eval.html`: implementar botão "Voltar" no header que chama `saveState()` e navega para `../pages/students.html` (ou `students.html` dependendo do path)
- [x] T009 [US1] Em `frontend/pages/student-eval.html`: implementar função `getAvaliacoesDoAluno(alunoId)` que filtra `state.avaliacoes` pelo `alunoId` e ordena por `data` ASC
- [x] T010 [US1] Em `frontend/pages/student-eval.html`: implementar função `renderListaAvaliacoes()` que exibe a lista de avaliações do aluno em `<div id="listaAvaliacoes">` — cada item mostra: data formatada (DD/MM/YYYY), chips de pontuação Tático/Técnico/Mental (reutilizar estilo dos chips de `students.html`), botões "Editar" e "Excluir" (ainda sem função — apenas renderizar); se lista vazia, exibir mensagem "Nenhuma avaliação registrada ainda."

**Checkpoint**: US1 completamente funcional e testável de forma independente — tela exibe histórico do aluno, Voltar funciona.

---

## Phase 4: User Story 2 — Registrar Nova Avaliação (Priority: P2)

**Goal**: Professor preenche formulário com data e pontuações (Tático, Técnico, Mental) e salva nova avaliação no histórico.

**Independent Test**: Na tela de avaliação de um aluno com histórico vazio, preencher data de hoje + notas para os 3 aspectos → clicar Salvar → confirmar que registro aparece na lista. Tentar salvar sem data → ver erro. Tentar salvar sem selecionar uma nota → ver erro.

### Implementation for User Story 2

- [x] T011 [US2] Em `frontend/pages/student-eval.html`: adicionar seção `<form id="formNovaAvaliacao">` acima da lista — com `<input type="date" id="inputDataAvaliacao">` (max = hoje), e três fieldsets com radio-groups reutilizando `renderNotaGroup()` para Tático (`tatico`), Técnico (`tecnico`) e Mental (`mental`); botão "Salvar Avaliação"
- [x] T012 [US2] Em `frontend/pages/student-eval.html`: implementar `renderNotaGroup(containerId, aspecto)` idêntica à de `students.html` para renderizar os 4 radio-buttons de nota em cada fieldset do formulário
- [x] T013 [US2] Em `frontend/pages/student-eval.html`: implementar `validateNovaAvaliacao()` — retorna array de erros se: `inputDataAvaliacao` vazio, data futura (> hoje), ou algum aspecto sem nota selecionada; exibir mensagens de erro em `<p role="alert">` abaixo de cada campo
- [x] T014 [US2] Em `frontend/pages/student-eval.html`: implementar submit handler do `formNovaAvaliacao` — validar, criar objeto `Avaliacao` com `generateId()`, `alunoId`, `data` (valor do input), `tecnico`, `tatico`, `mental` (valores dos radios), push em `state.avaliacoes`, chamar `saveState()`, `renderListaAvaliacoes()`, `showToast('Avaliação registrada com sucesso!')`, resetar formulário

**Checkpoint**: US2 completamente funcional — nova avaliação é salva, lista atualiza imediatamente, formulário reseta, toast aparece.

---

## Phase 5: User Story 3 — Editar ou Excluir Avaliação Existente (Priority: P3)

**Goal**: Professor pode corrigir dados de uma avaliação existente (edição inline) ou removê-la com confirmação.

**Independent Test**: Com 2 avaliações na lista: (1) Clicar Editar no 1º registro → campos ficam editáveis → alterar data e notas → Salvar → lista atualiza com novos valores. (2) Clicar Excluir no 2º registro → `window.confirm` → confirmar → registro some da lista.

### Implementation for User Story 3

- [x] T015 [US3] Em `frontend/pages/student-eval.html`: no `renderListaAvaliacoes()`, adicionar listener no botão "Editar" de cada item — ao clicar, substituir o HTML do item por um formulário inline com `<input type="date">` pré-preenchido e radio-groups pré-selecionados com os valores atuais da avaliação, mais botões "Salvar" e "Cancelar"
- [x] T016 [US3] Em `frontend/pages/student-eval.html`: implementar handler "Salvar" da edição inline — validar campos (mesma lógica de T013), atualizar o objeto na `state.avaliacoes` pelo `id`, chamar `saveState()`, `renderListaAvaliacoes()`, `showToast('Avaliação atualizada com sucesso!')`
- [x] T017 [US3] Em `frontend/pages/student-eval.html`: implementar handler "Cancelar" da edição inline — re-chamar `renderListaAvaliacoes()` descartando alterações, sem modificar `state`
- [x] T018 [US3] Em `frontend/pages/student-eval.html`: no `renderListaAvaliacoes()`, adicionar listener no botão "Excluir" de cada item — chamar `window.confirm('Excluir esta avaliação?')`, se confirmado: filtrar `state.avaliacoes` removendo o item pelo `id`, `saveState()`, `renderListaAvaliacoes()`, `showToast('Avaliação excluída.', 'error')`

**Checkpoint**: US3 completamente funcional — edição e exclusão funcionam sem afetar outros registros.

---

## Phase 6: User Story 4 — Visualizar Gráfico de Evolução do Aluno (Priority: P4)

**Goal**: Gráfico de linha com 3 séries (Tático, Técnico, Mental) ao longo do tempo, atualizado automaticamente a cada mutação.

**Independent Test**: Com 3 avaliações em datas diferentes, confirmar que o gráfico exibe 3 séries com os pontos corretos nos eixos X (datas) e Y (pontuações 2–5). Adicionar uma 4ª avaliação → gráfico ganha novo ponto. Excluir uma → gráfico perde o ponto.

### Implementation for User Story 4

- [x] T019 [US4] Em `frontend/pages/student-eval.html`: adicionar `<canvas id="graficoEvolucao" class="w-full"></canvas>` em uma `<section>` dedicada, acima da lista de avaliações — incluir título "Evolução do Aluno"
- [x] T020 [US4] Em `frontend/pages/student-eval.html`: implementar `renderGrafico(avaliacoes)` — recebe array ordenado de avaliações, extrai `labels` (datas formatadas DD/MM/YYYY) e `datasets` para Tático (`#facc15`), Técnico (`#4ade80`) e Mental (`#60a5fa`); instanciar `new Chart(ctx, config)` com `type: 'line'`, `scales.y.min: 2`, `scales.y.max: 5`, `scales.y.ticks.stepSize: 1`, `responsive: true`; se uma instância anterior do gráfico existir, chamar `.destroy()` antes de criar nova
- [x] T021 [US4] Em `frontend/pages/student-eval.html`: chamar `renderGrafico(getAvaliacoesDoAluno(alunoId))` na inicialização da página e após cada mutação: ao salvar nova avaliação (T014), ao salvar edição (T016), ao excluir (T018)
- [x] T022 [US4] Em `frontend/pages/student-eval.html`: aplicar estilos do gráfico consistentes com o tema escuro — `Chart.defaults.color = '#94a3b8'`, `Chart.defaults.borderColor = 'rgba(255,255,255,0.1)'`, fonte Tailwind sans, área do gráfico com `bg-imperial-dark-2 rounded-2xl p-4 border border-white/5`

**Checkpoint**: US4 completamente funcional — gráfico visível, reflete dados corretos, atualiza em tempo real após qualquer mutação.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes que afetam múltiplas user stories e qualidade geral da feature.

- [x] T023 [P] Em `frontend/pages/students.html`: remover o `<div id="modalAvaliacaoBackdrop">` e todo o código JavaScript relacionado ao modal de avaliação (funções `abrirModal`, `fecharModal`, `validateAvaliacaoForm`, listeners do modal) — o botão "Avaliar" agora navega para outra página (T004)
- [x] T024 [P] Em `frontend/pages/students.html`: atualizar `getAvaliacaoByAlunoId()` para continuar retornando a avaliação mais recente (para os chips na lista) — sem alteração de lógica, apenas garantir que funciona com o estado restaurado do `sessionStorage`
- [x] T025 Em `frontend/pages/student-eval.html`: garantir acessibilidade — `aria-label` nos botões Editar/Excluir incluindo nome/data da avaliação, `role="list"` na lista, `role="listitem"` em cada item, `aria-live="polite"` na área da lista
- [ ] T026 Validação manual completa seguindo `specs/004-cumulative-student-eval/quickstart.md` — testar todos os 7 cenários descritos, confirmar que nenhum registro é perdido ao navegar entre páginas  ← pendente validação manual

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente
- **Foundational (Phase 2)**: Depende de Phase 1 — BLOQUEIA todas as user stories
- **US1 (Phase 3)**: Depende de Phase 2
- **US2 (Phase 4)**: Depende de Phase 3 (renderização da lista deve existir para o form ser integrado)
- **US3 (Phase 5)**: Depende de Phase 3 (lista deve estar renderizada para edição/exclusão funcionar)
- **US4 (Phase 6)**: Pode iniciar após Phase 3 em paralelo com Phase 4/5 (canvas independente)
- **Polish (Phase 7)**: Depende de todas as fases anteriores

### User Story Dependencies

- **US1 (P1)**: Pode iniciar após Phase 2 — base de tudo
- **US2 (P2)**: Pode iniciar após US1 (lista deve existir para o re-render pós-salvar)
- **US3 (P3)**: Pode iniciar após US1 em paralelo com US2 (opera sobre lista já renderizada)
- **US4 (P4)**: Pode iniciar após US1 em paralelo com US2/US3 (canvas independente da lista)

### Parallel Opportunities

- T001, T002, T003 (Phase 1): T002 e T003 podem rodar em paralelo (arquivo diferente)
- T023 e T024 (Phase 7): podem rodar em paralelo (mesmas funções, sem conflito de edição)
- US3 (Phase 5) e US4 (Phase 6): podem ser desenvolvidas em paralelo após US1

---

## Parallel Example: User Story 1 + US3 + US4

```
# Após US1 estar completa, pode-se paralelizar:
Tarefa A (US3): T015 → T016 → T017 → T018  (edição/exclusão na lista)
Tarefa B (US4): T019 → T020 → T021 → T022  (canvas + Chart.js)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational
3. Completar Phase 3: US1
4. **PARAR E VALIDAR**: Tela de avaliação abre, lista exibe histórico, Voltar funciona
5. Demo para stakeholder

### Incremental Delivery

1. Setup + Foundational → navegação funcional entre pages
2. US1 → tela de avaliação com histórico (**MVP!**)
3. US2 → professor pode registrar novas avaliações
4. US3 → professor pode corrigir ou excluir registros
5. US4 → gráfico de evolução completa a feature
6. Polish → remoção do modal legado, acessibilidade

---

## Notes

- `[P]` = arquivos diferentes, sem dependências — podem ser implementadas em paralelo
- `[Story]` mapeia cada tarefa à user story correspondente para rastreabilidade
- Escala de pontuação: 2–5 (conforme código existente) — não alterar para 0–10
- Chart.js: sempre chamar `.destroy()` antes de re-instanciar para evitar vazamento de instâncias
- `sessionStorage` key: `"imperialState"` — consistente entre ambas as páginas
- Ao Voltar: sempre chamar `saveState()` antes de navegar, garantindo estado atualizado em `students.html`
